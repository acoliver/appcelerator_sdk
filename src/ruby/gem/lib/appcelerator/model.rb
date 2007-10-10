begin
	require 'cached_model'
end

module Appcelerator  
	class Model < ActiveRecord::Base
		self.abstract_class = true
		
		def Model.models
			APP_MODELS
		end
		
		def update
			super
			delete_cache if defined?(Cache) and defined?(Cache::CACHE)
		end
		
		def destroy
			super
			delete_cache if defined?(Cache) and defined?(Cache::CACHE)
		end
		
		private 
		def delete_cache
			# delete the PK entry
			Cache.delete "#{self.class.name}:id:#{quoted_id}" if defined?(Cache) and defined?(Cache::CACHE)
		end
		
		class << self
		
			def log(msg)
				if logger && logger.level == Logger::DEBUG
					logger.add(Logger::DEBUG, "Appcelerator::Model - #{msg}")
				end
			end
			
			def find_by_sql(*args)
			
				return super(args) if not defined?(Cache) and defined?(Cache::CACHE)
				return super(args) unless CachedModel.use_memcache? or CachedModel.use_local_cache?
		
				# don't cache result of :all
				return super(args) if args.first =~ /^SELECT \* FROM #{table_name}$/
				
				# don't do more complex finds
				case args.first
					when Array then
						return super(args)
					end
		
				# some SQL ends with space
				sql = args.first.chomp!(" ")
				log "SQL: #{sql}"
		
				if @model_regex==nil
					@model_regex = /^SELECT \* FROM #{table_name} WHERE \(#{table_name}\.`#{primary_key}` = (\d+)\)$/
				end
				
				# see if this is a single query for the primary key
				match = @model_regex.match(sql)
				pk = nil
				
				if match
					# extract the primary key
					pk = match[1]	
					
					# check to see if the record is in the DB with PK
					if CachedModel.use_memcache?
						result = Cache.get "#{name}:id:#{pk}"
						if result
							log "cache hit: #{name}.#{primary_key} -> #{pk}"
							result.instance_variable_set(:@new_record,false)
							return [result]
						else
							log "cache miss: #{name}.#{primary_key} -> #{pk}"
						end
					end
				end
				
				records = super(args)
				
				if CachedModel.use_memcache?
					# store in cache
					if pk
						Cache.put "#{name}:id:#{pk}", records.first, CachedModel.ttl
						log "cache set: #{name}.#{primary_key} -> #{pk}"
					end
				end
				
				records
			end
		end
	end
end
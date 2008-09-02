#
#
# Copyright 2006-2008 Appcelerator, Inc.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#    http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License. 


module Appcelerator
  class InmemoryServiceBroker
    def trace_send(klass,method,args,tms,result,ex)
      Appcelerator::AgentClient.instance.record(args.first.message_type,tms.real)
    end
    # override send to performance tracing and send the results of the
    # method benchmark to the agent for recording
    trace_method_for_performance :send,:trace_send
  end
end

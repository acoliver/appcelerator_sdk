/**
 *  Appcelerator SDK
 *  Copyright (C) 2006-2007 by Appcelerator, Inc. All Rights Reserved.
 *  For more information, please visit http://www.appcelerator.org
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

package org.appcelerator.compiler;

import org.appcelerator.compiler.compressor.Compressor;
import org.appcelerator.util.Util;
import org.cyberneko.html.parsers.DOMParser;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.EvaluatorException;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Appcelerator client code compiler
 * 
 * @author Jeff Haynie
 */
public class Compiler
{
	public static final String VERSION = "${version.major}.${version.minor}.${version.rev}";
	
    private static final Map<String,String> FROM_HTML_ENTITIES = new HashMap<String,String>();

    private static final Pattern APPCELERATOR_SCRIPT_RE = Pattern.compile("<script[^>]+src=\"([^\"]*appcelerator)(-debug)?\\.js\"");

    static
	{
        // TODO: map the rest from http://www.w3schools.com/tags/ref_entities.asp
	    FROM_HTML_ENTITIES.put("nbsp", "#160"); 
	    FROM_HTML_ENTITIES.put("iexcl", "#161"); 
	    FROM_HTML_ENTITIES.put("curren", "#164"); 
	    FROM_HTML_ENTITIES.put("cent", "#162"); 
	    FROM_HTML_ENTITIES.put("pound", "#163"); 
        FROM_HTML_ENTITIES.put("yen", "#165"); 
        FROM_HTML_ENTITIES.put("brvbar", "#166"); 
        FROM_HTML_ENTITIES.put("sect", "#167"); 
        FROM_HTML_ENTITIES.put("uml", "#168"); 
        FROM_HTML_ENTITIES.put("copy", "#169"); 
        FROM_HTML_ENTITIES.put("ordf", "#170"); 
        FROM_HTML_ENTITIES.put("laquo", "#171"); 
        FROM_HTML_ENTITIES.put("not", "#172"); 
        FROM_HTML_ENTITIES.put("shy", "#173"); 
        FROM_HTML_ENTITIES.put("reg", "#174"); 
        FROM_HTML_ENTITIES.put("trade", "#8482"); 
        FROM_HTML_ENTITIES.put("macr", "#175"); 
        FROM_HTML_ENTITIES.put("deg", "#176"); 
        FROM_HTML_ENTITIES.put("plusmn", "#177"); 
        FROM_HTML_ENTITIES.put("sup2", "#178"); 
	}

	private static HtmlTempFile makeTempHTML (File file) throws Exception
	{
		File tempFile = File.createTempFile("app", ".tmp", file.getParentFile());
        FileReader fileReader = new FileReader(file);
        
        BufferedReader reader = new BufferedReader(fileReader);
        
        StringBuilder builder=new StringBuilder();
        while (true)
        {
        	String line = reader.readLine();
        	if (line == null)
        	{
        		break;
        	}
        	builder.append(line).append("\n");
        }
        // we need to strip the DOCTYPE since our Rhino JS parser pukes on it!
        String html = builder.toString();
        int idx = html.indexOf("<!DOCTYPE");
        if (idx!=-1)
        {
        	int end = html.indexOf('>',idx);
        	html = html.substring(end+1);
        }


        Matcher matcher = APPCELERATOR_SCRIPT_RE.matcher(html);
        matcher.find();
        String appceleratorJsPath = matcher.group(1)+"-debug.js";
        File appceleratorJs = new File(file.getParent(), appceleratorJsPath);
        
        FileOutputStream fos=new FileOutputStream(tempFile);
        PrintWriter w = new PrintWriter(fos);
        w.println(html);
        w.flush();
        w.close();
        fos.close();

        return new HtmlTempFile(appceleratorJs, tempFile);
	}

    private static class HtmlTempFile {
        File appceleratorJs;
        File tempFile;
        HtmlTempFile(File appceleratorJs, File tempFile) {
            this.appceleratorJs = appceleratorJs;
            this.tempFile = tempFile;
        }
    }

    private static void loadFile (Context ctx, Scriptable scope, File file) throws Exception
    {
    	if (!file.exists())
    	{
    		throw new FileNotFoundException("couldn't find source file: "+file);
    	}
        System.out.println("Loading Javascript from: "+file.getParent()+"/"+file.getName());
        FileReader fileReader = new FileReader(file);
        ctx.evaluateReader(scope, fileReader, file.getName(), 1, null);
    }
    
    public static void compileFile (File infile, File outfile, PrintWriter out, boolean compress) throws Exception
    {
        Context ctx = Context.enter();
        File tempFile = null;
        try
        {
        	if (out==null)
        	{
        		out = new PrintWriter(System.out,true);
        	}
        	
        	System.err.println("Compiling..."+infile.getAbsolutePath());
        	
        	long started = System.currentTimeMillis();
        	
            Scriptable scope = ctx.initStandardObjects(null);
            Compressor compressor = new Compressor();
            
            // create some global variables
            ScriptableObject.putProperty(scope, "out", Context.toObject(out, scope));
            ScriptableObject.putProperty(scope, "err", Context.toObject(System.err, scope));
            DOMParser parser = new DOMParser();
            parser.setFeature("http://cyberneko.org/html/features/scanner/notify-builtin-refs", true);
            ScriptableObject.putProperty(scope, "DOMParser", Context.toObject(parser, scope));

            HtmlTempFile tmp = makeTempHTML(infile);
            tempFile = tmp.tempFile;
            
            ScriptableObject.putProperty(scope, "appcelerator_app_html", Context.toObject(tempFile.toURI(), scope));
            
            // initially load our bootstrap browser environment
            InputStream in = Compiler.class.getResourceAsStream("init.js");
            InputStreamReader reader = new InputStreamReader(in);
            ctx.evaluateReader(scope, reader, "init.js", 1, null);
            
            // load up our appcelerator file - use debug in case we have errors it's easier to debug line numbers
            File jsDir = new File(infile.getParentFile(),"js");
            File outJSFile = new File(jsDir,infile.getName()+".js");
            ScriptableObject.putProperty(scope, "appcelerator_app_js", outJSFile.getName());
            
            
            loadFile(ctx,scope,tmp.appceleratorJs);
            

            // load all modules
            File moduleDir = new File(tmp.appceleratorJs.getParentFile().getParentFile(), "modules");
            for (File file : moduleDir.listFiles())
            {
            	if (file.isDirectory())
            	{
                    File moduleFile = new File(file, file.getName()+".js");
            		if (moduleFile.exists())
            		{
                        try {
                            loadFile(ctx,scope,moduleFile);
                        } catch(EvaluatorException e) {
                            e.printStackTrace();
                        }
                    }
            	}
            }

            if (compress)
            {
                Scriptable scriptable = (Scriptable) ctx.evaluateString(scope, "Appcelerator.Compiler", null, 1, null);
                ScriptableObject.putProperty(scriptable, "compressor", Context.toObject(compressor,scriptable));
            }
            
            //
            // TODO:
            //
            // 1. only load CSS from modules if module is actually used (right now does all)
            // 2. create one big JS file instead of running JS inline (before for caching)
            //
            //
            
            
            // we have to re-map our element lookup to be smart about native java strings mapping as objects
            ctx.evaluateString(scope, "function $(element){var node,id; if (!id && typeof(element)=='string') {id=String(element); } if (!id) { id = element.id; } node = window.document.getElementById(id); return node;}", null, 1, null);
            // initialize and start load, compile
            ctx.evaluateString(scope, "Object.extend(DOMNodeList.prototype, Array.prototype);", null, 1, null);
            ctx.evaluateString(scope, "Appcelerator.Compiler.isCompiledMode = true;", null, 1, null);
            ctx.evaluateString(scope, "Appcelerator.Compiler.isInterpretiveMode = false;", null, 1, null);
            ctx.evaluateString(scope, "Appcelerator.Compiler.scopeMap = {};", null, 1, null);
            ctx.evaluateString(scope, "Appcelerator.Core.onloadInvoker();", null, 1, null);
            
            // get the result
            String compiledDocument = null;

            while (compiledDocument==null)
            {
                compiledDocument = (String)ctx.evaluateString(scope, "Appcelerator.Compiler.compiledDocument", null, 1, null);
                if (compiledDocument==null)
                {
                    Object obj = ctx.evaluateString(scope, "Appcelerator.ScriptNotFound", null, 1, null);
                    if (obj!=null && obj instanceof Boolean && ((Boolean)obj).booleanValue())
                    {
                        break;
                    }
                    Thread.sleep(100);
                }
            }
            
            if (null==compiledDocument)
            {
                copy(infile, outfile);
                return;
            }
            
            String compiledJS = (String)ctx.evaluateString(scope, "Appcelerator.Compiler.compiledJS", null, 1, null);
            Util.copyToFile(compiledJS, outJSFile);
            
            compiledDocument = compiledDocument.replaceAll("></img>", "/>");
            compiledDocument = compiledDocument.replaceAll("></br>", "/>");
            compiledDocument = compiledDocument.replaceAll("></input>", "/>");
            compiledDocument = compiledDocument.replaceAll("></meta>", "/>");
            
            if (compress)
            {
                compiledDocument = compiledDocument.replaceAll("\r","");
                compiledDocument = compiledDocument.replaceAll("\n","");
                compiledDocument = compiledDocument.replaceAll("\t"," ");
            }
            
        	out.println("Compiled "+infile.getName()+" in "+(System.currentTimeMillis()-started)+" ms");
        	out.flush();
        	
            // write out the HTML
            FileOutputStream fout = new FileOutputStream(outfile);
            PrintWriter writer = new PrintWriter(fout);
            writer.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">");
            for (String key : FROM_HTML_ENTITIES.keySet())
            {
                compiledDocument = compiledDocument.replaceAll("<"+key+"></"+key+">","&"+key+";");
            }
            writer.println(compiledDocument);
            writer.println();
            writer.println("<!-- Appcelerator: More App. Less Code. -->");
            writer.close();
            fout.close();
        }
        catch (Exception ex)
        {
        	System.err.println("Error compiling: "+infile.getAbsolutePath());
        	ex.printStackTrace();
        	
        	// in this case, just copy the none-compiled version
        	copy(infile, outfile);
        }
        finally
        {
            try
            {
                Context.exit();
            }
            catch (Exception ex) 
            {
            }
            if (tempFile!=null)
            {
            	tempFile.delete();
            }
        }
    }
    public static void compile (File indir, File outdir, PrintWriter out, boolean verbose, boolean compress) throws Exception
    {
    	if (!outdir.exists())
    	{
    		outdir.mkdirs();
    	}
    	for (File infile : indir.listFiles())
    	{
    		boolean copy = true;
    		if (infile.isFile())
    		{
        		String path = infile.getName();
        		int idx = path.lastIndexOf('.');
        		if (idx > 0)
        		{
        			String ext = path.substring(idx+1);
        			if (ext.equals("html"))
        			{
        				File outfile = new File(outdir,path);
        				compileFile(infile, outfile, out, compress);
        				copy = false;
        			}
        		}
    		}
    		if (copy)
    		{
    			File outfile = new File(outdir,infile.getName());
    			if (infile.isDirectory())
    			{
    			    if (verbose) out.println("Making directory: "+outfile);
    				outfile.mkdirs();
                    compile(infile, outfile, out, verbose, compress);
    			}
    			else
    			{
                    if (verbose) out.println("Copying "+infile+" to "+outfile);
    				copy(infile,outfile);
    			}
    		}
    	}
    }
    
    private static void copy (File infile, File outfile) throws Exception
    {
    	FileInputStream in = new FileInputStream(infile);
    	FileOutputStream out = new FileOutputStream(outfile);
    	
    	byte buf[] = new byte[8096];
    	while ( true )
    	{
    		int c = in.read(buf);
    		if (c<0)
    		{
    			break;
    		}
    		out.write(buf,0,c);
    	}
    	in.close();
    	out.close();
    }
    
    private static void printUsage() {
    	System.err.println(
			"Appcelerator Compiler\n\n"+
			"Usage: appc input_directory output_directory\n\n"+
			"Compiles all html files from input_directory into output directory"
		);
    }
    
    public static void main (String args[]) throws Exception
    {
    	if(args.length >= 1) {
            File inputDirectory = new File(args[0]);
	        File outputDirectory;
            if(args.length >= 2) {
                outputDirectory = new File(args[1]);
            } else {
               outputDirectory = new File(inputDirectory.getAbsolutePath()+"-compiled");
            }

            if(!inputDirectory.exists()) {
                System.err.println("Directory '"+args[0]+"' could not be found\n");
                printUsage();
            } else if(!inputDirectory.isDirectory()) {
                System.err.println("Path '"+args[0]+"' must be a directory\n");
                printUsage();
            } else {
                System.err.println("inputDirectory = "+ inputDirectory.getAbsolutePath());
	            System.err.println("outputDirectory = "+ outputDirectory.getAbsolutePath());
                compile(inputDirectory, outputDirectory,new PrintWriter(System.out),true,true);
            }
        } else {
    		printUsage();
    	}
        System.exit(0); // why?
    }
}

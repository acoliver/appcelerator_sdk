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
package org.appcelerator.compiler.compressor;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FilenameFilter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;

import org.appcelerator.util.Util;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

/**
 * @author jhaynie
 *
 */
public class Compressor
{
    public Compressor()
    {
    }
    public String compress (String input) throws Exception
    {
        return Compressor.compress(input, true, false, false);
    }
    public static String compress (String input, boolean munge, boolean warn, boolean linebreak) throws Exception
    {
        InputStreamReader in = new InputStreamReader(new ByteArrayInputStream(input.getBytes()), "UTF-8");
        JavaScriptCompressor compressor = new JavaScriptCompressor(in, new ErrorReporter() {

            public void warning(String message, String sourceName,
                    int line, String lineSource, int lineOffset) {
                if (line < 0) {
                    System.out.println("\n" + message);
                } else {
                    System.out.println("\n" + line + ':' + lineOffset + ':' + message);
                }
            }

            public void error(String message, String sourceName,
                    int line, String lineSource, int lineOffset) {
                if (line < 0) {
                    System.err.println("\n" + message);
                } else {
                    System.err.println("\n" + line + ':' + lineOffset + ':' + message);
                }
            }

            public EvaluatorException runtimeError(String message, String sourceName,
                    int line, String lineSource, int lineOffset) {
                error(message, sourceName, line, lineSource, lineOffset);
                return new EvaluatorException(message);
            }
        });

        // Close the input stream in case the output file should overwrite it...
        in.close();
        in = null;

        // Open the output stream now in case it should overwrite the input...
        ByteArrayOutputStream outstream = new ByteArrayOutputStream();
        OutputStreamWriter out = new OutputStreamWriter(outstream, "UTF-8");
        compressor.compress(out, linebreak, munge, warn);
        out.flush();
        return new String(outstream.toByteArray());
    }
    public static void main (String args[]) throws Exception
    {
        if (args.length!=2 && args.length!=3)
        {
            System.err.println("Usage: java "+Compressor.class.getName()+" <dir|file> <outdir> <backup>");
            System.exit(1);
        }
        
        File indir = new File(args[0]);
        File outdir = new File(args[1]);
        boolean backup = args.length == 3 ? Boolean.valueOf(args[2]) : false;
        
        File infiles[] = null;
        
        if (indir.isDirectory())
        {
            ArrayList<File> files = new ArrayList<File>();
            Util.collectFiles(indir, files, new FilenameFilter()
            {
                public boolean accept(File dir, String name)
                {
                    return name.endsWith(".js");
                }
            }, true);
            infiles = files.toArray(new File[files.size()]);
        }
        else
        {
            infiles = new File[]{indir};
        }
        
        for (File file : infiles)
        {
            String filename = file.getAbsolutePath();
            String filepart = filename.replace(indir.getAbsolutePath(),"");
            String jsin = Util.copyToString(file);
            String jsout = Compressor.compress(jsin, true, false, false);
            File outfile = new File(outdir,filepart);
            outfile.getParentFile().mkdirs();
            Util.copyToFile(jsout, outfile);
            if (backup)
            {
                File outfile_debug = new File(outdir,filepart.replace(".js","-debug.js"));
                Util.copyToFile(jsin, outfile_debug);
            }
        }
        
        System.exit(0);
    }
}

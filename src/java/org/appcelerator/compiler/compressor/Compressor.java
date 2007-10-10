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
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

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
        String js = "Appcelerator.Compiler.compileOnLoad=false;Appcelerator.Core.onload(function(){Appcelerator.Compiler.addFieldSet($(\"messagetype\"),false);Appcelerator.Compiler.wireValidator($(\"messagetype\"),\"required\");;;var ifCond = null;var action = \"l:send.test.message\";var target = $(\"app_12\");var actionFunc=eval(function(){Appcelerator.Compiler.fireMessageBrokerMessage(\"app_12\",\"l:send.test.message\",{\"id\": \"app_12\"})});var scope = {id:target.id};var cf = function(event){var me = $(\"app_12\");if (Element.isDisabled(me) || Element.isDisabled(me.parentNode)) return;var __method = actionFunc, args = $A(arguments);return __method.apply(scope, [event || window.event].concat(args));};var f = cf;if (false){f = function(e){cf(e);Event.stop(e);return false;};}Appcelerator.Compiler.addEventListener(target,\"click\",f,0);;;;$MQL(\"r:app.test.message\",\"appcelerator\",function(type,data,datatype,direction,scope){Appcelerator.Compiler.MessageAction.onMessage(type,data,datatype,direction,scope,null,function(){try {Element.visualEffect(\'messagebox\',\'Appear\'); Appcelerator.Compiler.publishEvent(\"messagebox\",\"effect\")}catch(exxx){ Appcelerator.Compiler.handleElementException($(\"messagebox\"),exxx,\"Executing:effect\")}},0);});;$MQL(\"r:app.test.message\",\"appcelerator\",function(type,data,datatype,direction,scope){Appcelerator.Compiler.MessageAction.onMessage(type,data,datatype,direction,scope,null,function(){try {Element.visualEffect(\'messagebox\',\'Fade\'); Appcelerator.Compiler.publishEvent(\"messagebox\",\"effect\")}catch(exxx){ Appcelerator.Compiler.handleElementException($(\"messagebox\"),exxx,\"Executing:effect\")}},5000);});$MQL(\"remote:app.test.message\",\"appcelerator\",function(type,data,datatype,direction,scope){Appcelerator.Compiler.MessageAction.onMessage(type,data,datatype,direction,scope,null,function(){try {$(\"app_15\").innerHTML=Object.getNestedProperty(data, \"message\",\"message\"); Appcelerator.Compiler.publishEvent(\"app_15\",\"value\")}catch(exxx){ Appcelerator.Compiler.handleElementException($(\"app_15\"),exxx,\"Executing:value\")}},0);});;;$MQL(\"r:~.*\",\"appcelerator\",function(type,data,datatype,direction,scope){Appcelerator.Compiler.MessageAction.onMessage(type,data,datatype,direction,scope,null,function(){try {$(\"trace\").value+=(function(){ return \'[\' + Appcelerator.Util.DateTime.get12HourTime() + \'] \' + this.direction+\':\' + this.type + \' =&gt; \' + this.data+\'\\n\' }).call(this);; Appcelerator.Compiler.executeFunction($(\"trace\"),\"revalidate\");; Appcelerator.Compiler.publishEvent(\"trace\",\"value\")}catch(exxx){ Appcelerator.Compiler.handleElementException($(\"trace\"),exxx,\"Executing:value\")}},0);});;;$MQL(\"local:send.test.message\",\"appcelerator\",function(type,data,datatype,direction,scope){Appcelerator.Compiler.MessageAction.onMessage(type,data,datatype,direction,scope,null,function(){try {Appcelerator.Compiler.executeFunction($(\"app_20\"),\"execute\",[\"app_20\",\"execute\",data,scope]); Appcelerator.Compiler.publishEvent(\"app_20\",\"execute\")}catch(exxx){ Appcelerator.Compiler.handleElementException($(\"app_20\"),exxx,\"Executing:execute\")}},0);});;;});";
        String out = compress(js,true,true,false);
        System.out.println(out);
    }
}


/*
 * Copyright 2006-2008 Appcelerator, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */

package org.appcelerator.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;

public class EncodingUtil
{
    public static void convert(File file, Charset from, String toEncoding,
            ByteArrayOutputStream bytearray, boolean headersOn,
            int totalLinesToRead) throws IOException
    {
        BufferedReader reader = new BufferedReader(new InputStreamReader(
                new FileInputStream(file), from));
        BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
                bytearray, toEncoding));

        for (int c = 0; c < totalLinesToRead; c++)
        {
            String tmpline = reader.readLine();
            if (tmpline == null)
                break;

            writer.write(tmpline, 0, tmpline.length());
            writer.write("\n", 0, 1);
        }
        writer.close();
    }
}

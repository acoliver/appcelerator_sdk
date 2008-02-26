/**
 * This file is part of Appcelerator.
 *
 * Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
 * For more information, please visit http://www.appcelerator.org
 *
 * Appcelerator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
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

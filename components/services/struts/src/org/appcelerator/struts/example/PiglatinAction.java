/*
 * $Id: LocaleAction.java 471754 2006-11-06 14:55:09Z husted $
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.appcelerator.struts.example;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.Action;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;


/**
 * <p>
 * Change user's Struts {@link java.util.Locale}.
 * </p>
 */
public final class PiglatinAction extends Action {

    /**
     * @param mapping  The ActionMapping used to select this instance
     * @param form     The optional ActionForm bean for this request (if any)
     * @param request  The HTTP request we are processing
     * @param response The HTTP response we are creating
     * @return An ActionForward indicate the resources that will render the
     *         response
     * @throws Exception if an input/output error or servlet exception occurs
     */
    public ActionForward execute(ActionMapping mapping,
                                 ActionForm form,
                                 HttpServletRequest request,
                                 HttpServletResponse response)
            throws Exception {
        
        if (!(form instanceof MessageForm)) {
            throw new IllegalArgumentException("Form needs to be a Messageform");
        }

        MessageForm messageForm = (MessageForm) form;
        String piglatined = pigLatin(messageForm.getMessage());
        messageForm.setMessage(piglatined);
        
        return mapping.findForward("Success");
    }
    

    /*
     * Method to translate a sentence word by word.
     * @param s The sentence in English
     * @return The pig latin version
     */
    private static String pigLatin(String s) {
      String latin = "";
      int i = 0;
      while (i<s.length()) {

        // Take care of punctuation and spaces
        while (i<s.length() && !isLetter(s.charAt(i))) {
          latin = latin + s.charAt(i);
          i++;
        }

        // If there aren't any words left, stop.
        if (i>=s.length()) break;

        // Otherwise we're at the beginning of a word.
        int begin = i;
        while (i<s.length() && isLetter(s.charAt(i))) {
          i++;
        }

        // Now we're at the end of a word, so translate it.
        int end = i;
        latin = latin + pigWord(s.substring(begin, end));
      }
      return latin;
    }

    /**
     * Method to test whether a character is a letter or not.
     * @param c The character to test
     * @return True if it's a letter
     */
    private static boolean isLetter(char c) {
      return ( (c >='A' && c <='Z') || (c >='a' && c <='z') );
    }

    /**
     * Method to translate one word into pig latin.
     * @param word The word in english
     * @return The pig latin version
     */
    private static String pigWord(String word) {
      int split = firstVowel(word);
      return word.substring(split)+"-"+word.substring(0, split)+"ay";
    }

    /**
     * Method to find the index of the first vowel in a word.
     * @param word The word to search
     * @return The index of the first vowel
     */
    private static int firstVowel(String word) {
      word = word.toLowerCase();
      for (int i=0; i<word.length(); i++)
        if (word.charAt(i)=='a' || word.charAt(i)=='e' ||
            word.charAt(i)=='i' || word.charAt(i)=='o' ||
            word.charAt(i)=='u')
          return i;
      return 0;
    }

}

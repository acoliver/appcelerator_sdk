/*
 * YUI Compressor
 * Author: Julien Lecomte <jlecomte@yahoo-inc.com>
 * Copyright (c) 2007, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 *     http://developer.yahoo.net/yui/license.txt
 */

package org.appcelerator.compiler.compressor;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Hashtable;

class ScriptOrFnScope {

    private int braceNesting;
    private ScriptOrFnScope parentScope;
    private ArrayList<ScriptOrFnScope> subScopes;
    private Hashtable<String, JavaScriptIdentifier> identifiers = new Hashtable<String, JavaScriptIdentifier>();
    private boolean markedForMunging = true;

    ScriptOrFnScope(int braceNesting, ScriptOrFnScope parentScope) {
        this.braceNesting = braceNesting;
        this.parentScope = parentScope;
        this.subScopes = new ArrayList<ScriptOrFnScope>();
        if (parentScope != null) {
            parentScope.subScopes.add(this);
        }
    }

    int getBraceNesting() {
        return braceNesting;
    }

    ScriptOrFnScope getParentScope() {
        return parentScope;
    }

    JavaScriptIdentifier declareIdentifier(String symbol) {
        JavaScriptIdentifier javaScriptIdentifier = identifiers.get(symbol);
        if (javaScriptIdentifier == null) {
            javaScriptIdentifier = new JavaScriptIdentifier(symbol, this);
            identifiers.put(symbol, javaScriptIdentifier);
        }
        return javaScriptIdentifier;
    }

    JavaScriptIdentifier getIdentifier(String symbol) {
        return identifiers.get(symbol);
    }

    void preventMunging() {
        if (parentScope != null) {
            // The symbols in the global scope don't get munged,
            // but the sub-scopes it contains do get munged.
            markedForMunging = false;
        }
    }

    private ArrayList<String> getUsedSymbols() {
        ArrayList<String> result = new ArrayList<String>();
        Enumeration<JavaScriptIdentifier> elements = identifiers.elements();
        while (elements.hasMoreElements()) {
            JavaScriptIdentifier javaScriptIdentifier = elements.nextElement();
            String mungedValue = javaScriptIdentifier.getMungedValue();
            if (mungedValue == null) {
                mungedValue = javaScriptIdentifier.getValue();
            }
            result.add(mungedValue);
        }
        return result;
    }

    private ArrayList<String> getAllUsedSymbols() {
        ArrayList<String> result = new ArrayList<String>();
        ScriptOrFnScope scope = this;
        while (scope != null) {
            result.addAll(scope.getUsedSymbols());
            scope = scope.parentScope;
        }
        return result;
    }

    void munge() {

        if (!markedForMunging) {
            // Stop right here if this scope was flagged as unsafe for munging.
            return;
        }

        int pickFromSet = 1;

        // Do not munge symbols in the global scope!
        if (parentScope != null) {

            ArrayList<String> freeSymbols = new ArrayList<String>();

            freeSymbols.addAll(JavaScriptCompressor.ones);
            freeSymbols.removeAll(getAllUsedSymbols());
            if (freeSymbols.size() == 0) {
                pickFromSet = 2;
                freeSymbols.addAll(JavaScriptCompressor.twos);
                freeSymbols.removeAll(getAllUsedSymbols());
            }
            if (freeSymbols.size() == 0) {
                pickFromSet = 3;
                freeSymbols.addAll(JavaScriptCompressor.threes);
                freeSymbols.removeAll(getAllUsedSymbols());
            }
            if (freeSymbols.size() == 0) {
                System.err.println("The YUI Compressor ran out of symbols. Aborting...");
                System.exit(1);
            }

            Enumeration<JavaScriptIdentifier> elements = identifiers.elements();
            while (elements.hasMoreElements()) {
                if (freeSymbols.size() == 0) {
                    pickFromSet++;
                    if (pickFromSet == 2) {
                        freeSymbols.addAll(JavaScriptCompressor.twos);
                    } else if (pickFromSet == 3) {
                        freeSymbols.addAll(JavaScriptCompressor.threes);
                    } else {
                        System.err.println("The YUI Compressor ran out of symbols. Aborting...");
                        System.exit(1);
                    }
                    // It is essential to remove the symbols already used in
                    // the containing scopes, or some of the variables declared
                    // in the containing scopes will be redeclared, which can
                    // lead to errors.
                    freeSymbols.removeAll(getAllUsedSymbols());
                }
                JavaScriptIdentifier javaScriptIdentifier = elements.nextElement();
                String mungedValue = (String) freeSymbols.remove(0);
                javaScriptIdentifier.setMungedValue(mungedValue);
            }
        }

        for (int i = 0; i < subScopes.size(); i++) {
            ScriptOrFnScope scope = subScopes.get(i);
            scope.munge();
        }
    }
}

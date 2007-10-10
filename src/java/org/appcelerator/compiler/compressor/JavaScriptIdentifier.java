/*
 * YUI Compressor
 * Author: Julien Lecomte <jlecomte@yahoo-inc.com>
 * Copyright (c) 2007, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 *     http://developer.yahoo.net/yui/license.txt
 */

package org.appcelerator.compiler.compressor;

import org.mozilla.javascript.Token;

/**
 * JavaScriptIdentifier represents a variable/function identifier.
 */
class JavaScriptIdentifier extends JavaScriptToken {

    private int refcount = 0;
    private String mungedValue;
    private ScriptOrFnScope declaredScope;

    JavaScriptIdentifier(String value, ScriptOrFnScope declaredScope) {
        super(Token.NAME, value);
        this.declaredScope = declaredScope;
    }

    ScriptOrFnScope getDeclaredScope() {
        return declaredScope;
    }

    void setMungedValue(String value) {
        mungedValue = value;
    }

    String getMungedValue() {
        return mungedValue;
    }

    void incrementRefcount() {
        refcount++;
    }

    int getRefcount() {
        return refcount;
    }
}

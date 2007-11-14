/*
 * Author: Amro Mousa
 * Contact: amousa@appcelerator.com
 */
using System;
using System.Collections.Generic;
using System.Text;

namespace Appcelerator
{
    public enum MessageDirection
    {
        /**
         * message is incoming from a server perspective
         */
        INCOMING,
        /**
         * message is outgoing from a server perspective
         */
        OUTGOING,
        /**
         * message is any perspective
         */
        ANY
    }
}


/**
 * utility function to generate a semi-random uuid
 * which is good enough as a unique id for portlets
 */
Appcelerator.Util.UUID =
{
    dateSeed: new Date().getTime(),

    generateNewId: function()
    {
        var a = Math.round(9999999999 * Math.random());
        var b = Math.round(9999999999 * Math.random());
        var c = Math.round(this.dateSeed * Math.random());
        return a + "-" + b + "-" + c;
    }
};
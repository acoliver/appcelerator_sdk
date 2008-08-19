/*!
 * This file is part of Appcelerator.
 *
 * Copyright (c) 2006-2008, Appcelerator, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 *     * Neither the name of Appcelerator, Inc. nor the names of its
 *       contributors may be used to endorse or promote products derived from this
 *       software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 *  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
package org.appcelerator.util;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

/**
 * URLUtil
 *
 * @author <a href="mailto:jhaynie@appcelerator.com">Jeff Haynie</a>
 */
public class URLUtil
{
    public static final Collection<String> COUNTRY_TLDS = new TreeSet<String>();
    public static final Collection<String> TLDS = new TreeSet<String>();
    public static final Collection<String> TWO_LEVEL_TLD = new TreeSet<String>();

    static
    {
        //
        //country tlds
        //
        TLDS.add("ac"); // Ascension Island
        TLDS.add("ad"); // Andorra
        TLDS.add("ae"); // United Arab Emirates
        TLDS.add("af"); // Afghanistan
        TLDS.add("ag"); // Antigua and Barbuda
        TLDS.add("ai"); // Anguilla
        TLDS.add("al"); // Albania
        TLDS.add("am"); // Armenia
        TLDS.add("an"); // Netherlands Antilles
        TLDS.add("ao"); // Angola
        TLDS.add("aq"); // Antarctica
        TLDS.add("ar"); // Argentina
        TLDS.add("as"); // American Samoa
        TLDS.add("at"); // Austria
        TLDS.add("au"); // Australia
        TLDS.add("aw"); // Aruba
        TLDS.add("az"); // Azerbaijan
        TLDS.add("ax"); // Aland Islands
        TLDS.add("ba"); // Bosnia and Herzegovina
        TLDS.add("bb"); // Barbados
        TLDS.add("bd"); // Bangladesh
        TLDS.add("be"); // Belgium
        TLDS.add("bf"); // Burkina Faso
        TLDS.add("bg"); // Bulgaria
        TLDS.add("bh"); // Bahrain
        TLDS.add("bi"); // Burundi
        TLDS.add("bj"); // Benin
        TLDS.add("bm"); // Bermuda
        TLDS.add("bn"); // Brunei Darussalam
        TLDS.add("bo"); // Bolivia
        TLDS.add("br"); // Brazil
        TLDS.add("bs"); // Bahamas
        TLDS.add("bt"); // Bhutan
        TLDS.add("bv"); // Bouvet Island
        TLDS.add("bw"); // Botswana
        TLDS.add("by"); // Belarus
        TLDS.add("bz"); // Belize
        TLDS.add("ca"); // Canada
        TLDS.add("cc"); // Cocos (Keeling) Islands
        TLDS.add("cd"); // Congo, The Democratic Republic of the
        TLDS.add("cf"); // Central African Republic
        TLDS.add("cg"); // Congo, Republic of
        TLDS.add("ch"); // Switzerland
        TLDS.add("ci"); // Cote d'Ivoire
        TLDS.add("ck"); // Cook Islands
        TLDS.add("cl"); // Chile
        TLDS.add("cm"); // Cameroon
        TLDS.add("cn"); // China
        TLDS.add("co"); // Colombia
        TLDS.add("cr"); // Costa Rica
        TLDS.add("cs"); // Serbia and Montenegro
        TLDS.add("cu"); // Cuba
        TLDS.add("cv"); // Cape Verde
        TLDS.add("cx"); // Christmas Island
        TLDS.add("cy"); // Cyprus
        TLDS.add("cz"); // Czech Republic
        TLDS.add("de"); // Germany
        TLDS.add("dj"); // Djibouti
        TLDS.add("dk"); // Denmark
        TLDS.add("dm"); // Dominica
        TLDS.add("do"); // Dominican Republic
        TLDS.add("dz"); // Algeria
        TLDS.add("ec"); // Ecuador
        TLDS.add("ee"); // Estonia
        TLDS.add("eg"); // Egypt
        TLDS.add("eh"); // Western Sahara
        TLDS.add("er"); // Eritrea
        TLDS.add("es"); // Spain
        TLDS.add("et"); // Ethiopia
        TLDS.add("eu"); // European Union
        TLDS.add("fi"); // Finland
        TLDS.add("fj"); // Fiji
        TLDS.add("fk"); // Falkland Islands (Malvinas)
        TLDS.add("fm"); // Micronesia, Federal State of
        TLDS.add("fo"); // Faroe Islands
        TLDS.add("fr"); // France
        TLDS.add("ga"); // Gabon
        TLDS.add("gb"); // United Kingdom
        TLDS.add("gd"); // Grenada
        TLDS.add("ge"); // Georgia
        TLDS.add("gf"); // French Guiana
        TLDS.add("gg"); // Guernsey
        TLDS.add("gh"); // Ghana
        TLDS.add("gi"); // Gibraltar
        TLDS.add("gl"); // Greenland
        TLDS.add("gm"); // Gambia
        TLDS.add("gn"); // Guinea
        TLDS.add("gp"); // Guadeloupe
        TLDS.add("gq"); // Equatorial Guinea
        TLDS.add("gr"); // Greece
        TLDS.add("gs"); // South Georgia and the South Sandwich Islands
        TLDS.add("gt"); // Guatemala
        TLDS.add("gu"); // Guam
        TLDS.add("gw"); // Guinea-Bissau
        TLDS.add("gy"); // Guyana
        TLDS.add("hk"); // Hong Kong
        TLDS.add("hm"); // Heard and McDonald Islands
        TLDS.add("hn"); // Honduras
        TLDS.add("hr"); // Croatia/Hrvatska
        TLDS.add("ht"); // Haiti
        TLDS.add("hu"); // Hungary
        TLDS.add("id"); // Indonesia
        TLDS.add("ie"); // Ireland
        TLDS.add("il"); // Israel
        TLDS.add("im"); // Isle of Man
        TLDS.add("in"); // India
        TLDS.add("io"); // British Indian Ocean Territory
        TLDS.add("iq"); // Iraq
        TLDS.add("ir"); // Iran, Islamic Republic of
        TLDS.add("is"); // Iceland
        TLDS.add("it"); // Italy
        TLDS.add("je"); // Jersey
        TLDS.add("jm"); // Jamaica
        TLDS.add("jo"); // Jordan
        TLDS.add("jp"); // Japan
        TLDS.add("ke"); // Kenya
        TLDS.add("kg"); // Kyrgyzstan
        TLDS.add("kh"); // Cambodia
        TLDS.add("ki"); // Kiribati
        TLDS.add("km"); // Comoros
        TLDS.add("kn"); // Saint Kitts and Nevis
        TLDS.add("kp"); // Korea, Democratic People's Republic
        TLDS.add("kr"); // Korea, Republic of
        TLDS.add("kw"); // Kuwait
        TLDS.add("ky"); // Cayman Islands
        TLDS.add("kz"); // Kazakhstan
        TLDS.add("la"); // Lao People's Democratic Republic
        TLDS.add("lb"); // Lebanon
        TLDS.add("lc"); // Saint Lucia
        TLDS.add("li"); // Liechtenstein
        TLDS.add("lk"); // Sri Lanka
        TLDS.add("lr"); // Liberia
        TLDS.add("ls"); // Lesotho
        TLDS.add("lt"); // Lithuania
        TLDS.add("lu"); // Luxembourg
        TLDS.add("lv"); // Latvia
        TLDS.add("ly"); // Libyan Arab Jamahiriya
        TLDS.add("ma"); // Morocco
        TLDS.add("mc"); // Monaco
        TLDS.add("md"); // Moldova, Republic of
        TLDS.add("mg"); // Madagascar
        TLDS.add("mh"); // Marshall Islands
        TLDS.add("mk"); // Macedonia, The Former Yugoslav Republic of
        TLDS.add("ml"); // Mali
        TLDS.add("mm"); // Myanmar
        TLDS.add("mn"); // Mongolia
        TLDS.add("mo"); // Macau
        TLDS.add("mp"); // Northern Mariana Islands
        TLDS.add("mq"); // Martinique
        TLDS.add("mr"); // Mauritania
        TLDS.add("ms"); // Montserrat
        TLDS.add("mt"); // Malta
        TLDS.add("mu"); // Mauritius
        TLDS.add("mv"); // Maldives
        TLDS.add("mw"); // Malawi
        TLDS.add("mx"); // Mexico
        TLDS.add("my"); // Malaysia
        TLDS.add("mz"); // Mozambique
        TLDS.add("na"); // Namibia
        TLDS.add("nc"); // New Caledonia
        TLDS.add("ne"); // Niger
        TLDS.add("nf"); // Norfolk Island
        TLDS.add("ng"); // Nigeria
        TLDS.add("ni"); // Nicaragua
        TLDS.add("nl"); // Netherlands
        TLDS.add("no"); // Norway
        TLDS.add("np"); // Nepal
        TLDS.add("nr"); // Nauru
        TLDS.add("nu"); // Niue
        TLDS.add("nz"); // New Zealand
        TLDS.add("om"); // Oman
        TLDS.add("pa"); // Panama
        TLDS.add("pe"); // Peru
        TLDS.add("pf"); // French Polynesia
        TLDS.add("pg"); // Papua New Guinea
        TLDS.add("ph"); // Philippines
        TLDS.add("pk"); // Pakistan
        TLDS.add("pl"); // Poland
        TLDS.add("pm"); // Saint Pierre and Miquelon
        TLDS.add("pn"); // Pitcairn Island
        TLDS.add("pr"); // Puerto Rico
        TLDS.add("ps"); // Palestinian Territories
        TLDS.add("pt"); // Portugal
        TLDS.add("pw"); // Palau
        TLDS.add("py"); // Paraguay
        TLDS.add("qa"); // Qatar
        TLDS.add("re"); // Reunion Island
        TLDS.add("ro"); // Romania
        TLDS.add("ru"); // Russian Federation
        TLDS.add("rw"); // Rwanda
        TLDS.add("sa"); // Saudi Arabia
        TLDS.add("sb"); // Solomon Islands
        TLDS.add("sc"); // Seychelles
        TLDS.add("sd"); // Sudan
        TLDS.add("se"); // Sweden
        TLDS.add("sg"); // Singapore
        TLDS.add("sh"); // Saint Helena
        TLDS.add("si"); // Slovenia
        TLDS.add("sj"); // Svalbard and Jan Mayen Islands
        TLDS.add("sk"); // Slovak Republic
        TLDS.add("sl"); // Sierra Leone
        TLDS.add("sm"); // San Marino
        TLDS.add("sn"); // Senegal
        TLDS.add("so"); // Somalia
        TLDS.add("sr"); // Suriname
        TLDS.add("st"); // Sao Tome and Principe
        TLDS.add("sv"); // El Salvador
        TLDS.add("sy"); // Syrian Arab Republic
        TLDS.add("sz"); // Swaziland
        TLDS.add("tc"); // Turks and Caicos Islands
        TLDS.add("td"); // Chad
        TLDS.add("tf"); // French Southern Territories
        TLDS.add("tg"); // Togo
        TLDS.add("th"); // Thailand
        TLDS.add("tj"); // Tajikistan
        TLDS.add("tk"); // Tokelau
        TLDS.add("tl"); // Timor-Leste
        TLDS.add("tm"); // Turkmenistan
        TLDS.add("tn"); // Tunisia
        TLDS.add("to"); // Tonga
        TLDS.add("tp"); // East Timor
        TLDS.add("tr"); // Turkey
        TLDS.add("tt"); // Trinidad and Tobago
        TLDS.add("tv"); // Tuvalu
        TLDS.add("tw"); // Taiwan
        TLDS.add("tz"); // Tanzania
        TLDS.add("ua"); // Ukraine
        TLDS.add("ug"); // Uganda
        TLDS.add("uk"); // United Kingdom
        TLDS.add("um"); // United States Minor Outlying Islands
        TLDS.add("us"); // United States
        TLDS.add("uy"); // Uruguay
        TLDS.add("uz"); // Uzbekistan
        TLDS.add("va"); // Holy See (Vatican City State)
        TLDS.add("vc"); // Saint Vincent and the Grenadines
        TLDS.add("ve"); // Venezuela
        TLDS.add("vg"); // Virgin Islands, British
        TLDS.add("vi"); // Virgin Islands, U.S.
        TLDS.add("vn"); // Vietnam
        TLDS.add("vu"); // Vanuatu
        TLDS.add("wf"); // Wallis and Futuna Islands
        TLDS.add("ws"); // Samoa
        TLDS.add("ye"); // Yemen
        TLDS.add("yt"); // Mayotte
        TLDS.add("yu"); // Yugoslavia
        TLDS.add("za"); // South Africa
        TLDS.add("zm"); // Zambia
        TLDS.add("zw"); // Zimbabwe

        // add to our country-specific TLDS
        COUNTRY_TLDS.addAll(TLDS);

        // list of two-level TLDs
        TWO_LEVEL_TLD.add("com.ac");
        TWO_LEVEL_TLD.add("edu.ac");
        TWO_LEVEL_TLD.add("gov.ac");
        TWO_LEVEL_TLD.add("net.ac");
        TWO_LEVEL_TLD.add("mil.ac");
        TWO_LEVEL_TLD.add("org.ac");
        TWO_LEVEL_TLD.add("com.ae");
        TWO_LEVEL_TLD.add("net.ae");
        TWO_LEVEL_TLD.add("org.ae");
        TWO_LEVEL_TLD.add("gov.ae");
        TWO_LEVEL_TLD.add("ac.ae");
        TWO_LEVEL_TLD.add("co.ae");
        TWO_LEVEL_TLD.add("sch.ae");
        TWO_LEVEL_TLD.add("pro.ae");
        TWO_LEVEL_TLD.add("com.ai");
        TWO_LEVEL_TLD.add("org.ai");
        TWO_LEVEL_TLD.add("edu.ai");
        TWO_LEVEL_TLD.add("gov.ai");
        TWO_LEVEL_TLD.add("com.ar");
        TWO_LEVEL_TLD.add("net.ar");
        TWO_LEVEL_TLD.add("org.ar");
        TWO_LEVEL_TLD.add("gov.ar");
        TWO_LEVEL_TLD.add("mil.ar");
        TWO_LEVEL_TLD.add("edu.ar");
        TWO_LEVEL_TLD.add("int.ar");
        TWO_LEVEL_TLD.add("co.at");
        TWO_LEVEL_TLD.add("ac.at");
        TWO_LEVEL_TLD.add("or.at");
        TWO_LEVEL_TLD.add("gv.at");
        TWO_LEVEL_TLD.add("priv.at");
        TWO_LEVEL_TLD.add("com.au");
        TWO_LEVEL_TLD.add("gov.au");
        TWO_LEVEL_TLD.add("org.au");
        TWO_LEVEL_TLD.add("edu.au");
        TWO_LEVEL_TLD.add("id.au");
        TWO_LEVEL_TLD.add("oz.au");
        TWO_LEVEL_TLD.add("info.au");
        TWO_LEVEL_TLD.add("net.au");
        TWO_LEVEL_TLD.add("asn.au");
        TWO_LEVEL_TLD.add("csiro.au");
        TWO_LEVEL_TLD.add("telememo.au");
        TWO_LEVEL_TLD.add("conf.au");
        TWO_LEVEL_TLD.add("otc.au");
        TWO_LEVEL_TLD.add("id.au");
        TWO_LEVEL_TLD.add("com.az");
        TWO_LEVEL_TLD.add("net.az");
        TWO_LEVEL_TLD.add("org.az");
        TWO_LEVEL_TLD.add("com.bb");
        TWO_LEVEL_TLD.add("net.bb");
        TWO_LEVEL_TLD.add("org.bb");
        TWO_LEVEL_TLD.add("ac.be");
        TWO_LEVEL_TLD.add("belgie.be");
        TWO_LEVEL_TLD.add("dns.be");
        TWO_LEVEL_TLD.add("fgov.be");
        TWO_LEVEL_TLD.add("com.bh");
        TWO_LEVEL_TLD.add("gov.bh");
        TWO_LEVEL_TLD.add("net.bh");
        TWO_LEVEL_TLD.add("edu.bh");
        TWO_LEVEL_TLD.add("org.bh");
        TWO_LEVEL_TLD.add("com.bm");
        TWO_LEVEL_TLD.add("edu.bm");
        TWO_LEVEL_TLD.add("gov.bm");
        TWO_LEVEL_TLD.add("org.bm");
        TWO_LEVEL_TLD.add("net.bm");
        TWO_LEVEL_TLD.add("adm.br");
        TWO_LEVEL_TLD.add("adv.br");
        TWO_LEVEL_TLD.add("agr.br");
        TWO_LEVEL_TLD.add("am.br");
        TWO_LEVEL_TLD.add("arq.br");
        TWO_LEVEL_TLD.add("art.br");
        TWO_LEVEL_TLD.add("ato.br");
        TWO_LEVEL_TLD.add("bio.br");
        TWO_LEVEL_TLD.add("bmd.br");
        TWO_LEVEL_TLD.add("cim.br");
        TWO_LEVEL_TLD.add("cng.br");
        TWO_LEVEL_TLD.add("cnt.br");
        TWO_LEVEL_TLD.add("com.br");
        TWO_LEVEL_TLD.add("coop.br");
        TWO_LEVEL_TLD.add("ecn.br");
        TWO_LEVEL_TLD.add("edu.br");
        TWO_LEVEL_TLD.add("eng.br");
        TWO_LEVEL_TLD.add("esp.br");
        TWO_LEVEL_TLD.add("etc.br");
        TWO_LEVEL_TLD.add("eti.br");
        TWO_LEVEL_TLD.add("far.br");
        TWO_LEVEL_TLD.add("fm.br");
        TWO_LEVEL_TLD.add("fnd.br");
        TWO_LEVEL_TLD.add("fot.br");
        TWO_LEVEL_TLD.add("fst.br");
        TWO_LEVEL_TLD.add("g12.br");
        TWO_LEVEL_TLD.add("ggf.br");
        TWO_LEVEL_TLD.add("gov.br");
        TWO_LEVEL_TLD.add("imb.br");
        TWO_LEVEL_TLD.add("ind.br");
        TWO_LEVEL_TLD.add("inf.br");
        TWO_LEVEL_TLD.add("jor.br");
        TWO_LEVEL_TLD.add("lel.br");
        TWO_LEVEL_TLD.add("mat.br");
        TWO_LEVEL_TLD.add("med.br");
        TWO_LEVEL_TLD.add("mil.br");
        TWO_LEVEL_TLD.add("mus.br");
        TWO_LEVEL_TLD.add("net.br");
        TWO_LEVEL_TLD.add("nom.br");
        TWO_LEVEL_TLD.add("not.br");
        TWO_LEVEL_TLD.add("ntr.br");
        TWO_LEVEL_TLD.add("odo.br");
        TWO_LEVEL_TLD.add("org.br");
        TWO_LEVEL_TLD.add("ppg.br");
        TWO_LEVEL_TLD.add("pro.br");
        TWO_LEVEL_TLD.add("psc.br");
        TWO_LEVEL_TLD.add("psi.br");
        TWO_LEVEL_TLD.add("qsl.br");
        TWO_LEVEL_TLD.add("rec.br");
        TWO_LEVEL_TLD.add("slg.br");
        TWO_LEVEL_TLD.add("srv.br");
        TWO_LEVEL_TLD.add("tmp.br");
        TWO_LEVEL_TLD.add("trd.br");
        TWO_LEVEL_TLD.add("tur.br");
        TWO_LEVEL_TLD.add("tv.br");
        TWO_LEVEL_TLD.add("vet.br");
        TWO_LEVEL_TLD.add("zlg.br");
        TWO_LEVEL_TLD.add("com.bs");
        TWO_LEVEL_TLD.add("net.bs");
        TWO_LEVEL_TLD.add("org.bs");
        TWO_LEVEL_TLD.add("com.bz");
        TWO_LEVEL_TLD.add("net.bz");
        TWO_LEVEL_TLD.add("org.bz");
        TWO_LEVEL_TLD.add("ab.ca");
        TWO_LEVEL_TLD.add("bc.ca");
        TWO_LEVEL_TLD.add("mb.ca");
        TWO_LEVEL_TLD.add("nb.ca");
        TWO_LEVEL_TLD.add("nf.ca");
        TWO_LEVEL_TLD.add("nl.ca");
        TWO_LEVEL_TLD.add("ns.ca");
        TWO_LEVEL_TLD.add("nt.ca");
        TWO_LEVEL_TLD.add("nu.ca");
        TWO_LEVEL_TLD.add("on.ca");
        TWO_LEVEL_TLD.add("pe.ca");
        TWO_LEVEL_TLD.add("qc.ca");
        TWO_LEVEL_TLD.add("sk.ca");
        TWO_LEVEL_TLD.add("yk.ca");
        TWO_LEVEL_TLD.add("gc.ca");
        TWO_LEVEL_TLD.add("co.ck");
        TWO_LEVEL_TLD.add("net.ck");
        TWO_LEVEL_TLD.add("org.ck");
        TWO_LEVEL_TLD.add("edu.ck");
        TWO_LEVEL_TLD.add("gov.ck");
        TWO_LEVEL_TLD.add("com.cn");
        TWO_LEVEL_TLD.add("edu.cn");
        TWO_LEVEL_TLD.add("gov.cn");
        TWO_LEVEL_TLD.add("net.cn");
        TWO_LEVEL_TLD.add("org.cn");
        TWO_LEVEL_TLD.add("ac.cn");
        TWO_LEVEL_TLD.add("ah.cn");
        TWO_LEVEL_TLD.add("bj.cn");
        TWO_LEVEL_TLD.add("cq.cn");
        TWO_LEVEL_TLD.add("gd.cn");
        TWO_LEVEL_TLD.add("gs.cn");
        TWO_LEVEL_TLD.add("gx.cn");
        TWO_LEVEL_TLD.add("gz.cn");
        TWO_LEVEL_TLD.add("hb.cn");
        TWO_LEVEL_TLD.add("he.cn");
        TWO_LEVEL_TLD.add("hi.cn");
        TWO_LEVEL_TLD.add("hk.cn");
        TWO_LEVEL_TLD.add("hl.cn");
        TWO_LEVEL_TLD.add("hn.cn");
        TWO_LEVEL_TLD.add("jl.cn");
        TWO_LEVEL_TLD.add("js.cn");
        TWO_LEVEL_TLD.add("ln.cn");
        TWO_LEVEL_TLD.add("mo.cn");
        TWO_LEVEL_TLD.add("nm.cn");
        TWO_LEVEL_TLD.add("nx.cn");
        TWO_LEVEL_TLD.add("qh.cn");
        TWO_LEVEL_TLD.add("sc.cn");
        TWO_LEVEL_TLD.add("sn.cn");
        TWO_LEVEL_TLD.add("sh.cn");
        TWO_LEVEL_TLD.add("sx.cn");
        TWO_LEVEL_TLD.add("tj.cn");
        TWO_LEVEL_TLD.add("tw.cn");
        TWO_LEVEL_TLD.add("xj.cn");
        TWO_LEVEL_TLD.add("xz.cn");
        TWO_LEVEL_TLD.add("yn.cn");
        TWO_LEVEL_TLD.add("zj.cn");
        TWO_LEVEL_TLD.add("arts.co");
        TWO_LEVEL_TLD.add("com.co");
        TWO_LEVEL_TLD.add("edu.co");
        TWO_LEVEL_TLD.add("firm.co");
        TWO_LEVEL_TLD.add("gov.co");
        TWO_LEVEL_TLD.add("info.co");
        TWO_LEVEL_TLD.add("int.co");
        TWO_LEVEL_TLD.add("nom.co");
        TWO_LEVEL_TLD.add("mil.co");
        TWO_LEVEL_TLD.add("org.co");
        TWO_LEVEL_TLD.add("rec.co");
        TWO_LEVEL_TLD.add("store.co");
        TWO_LEVEL_TLD.add("web.co");
        TWO_LEVEL_TLD.add("ac.cr");
        TWO_LEVEL_TLD.add("co.cr");
        TWO_LEVEL_TLD.add("ed.cr");
        TWO_LEVEL_TLD.add("fi.cr");
        TWO_LEVEL_TLD.add("go.cr");
        TWO_LEVEL_TLD.add("or.cr");
        TWO_LEVEL_TLD.add("sa.cr");
        TWO_LEVEL_TLD.add("com.cu");
        TWO_LEVEL_TLD.add("net.cu");
        TWO_LEVEL_TLD.add("org.cu");
        TWO_LEVEL_TLD.add("ac.cy");
        TWO_LEVEL_TLD.add("com.cy");
        TWO_LEVEL_TLD.add("gov.cy");
        TWO_LEVEL_TLD.add("net.cy");
        TWO_LEVEL_TLD.add("org.cy");
        TWO_LEVEL_TLD.add("co.dk");
        TWO_LEVEL_TLD.add("art.do");
        TWO_LEVEL_TLD.add("com.do");
        TWO_LEVEL_TLD.add("edu.do");
        TWO_LEVEL_TLD.add("gov.do");
        TWO_LEVEL_TLD.add("gob.do");
        TWO_LEVEL_TLD.add("org.do");
        TWO_LEVEL_TLD.add("mil.do");
        TWO_LEVEL_TLD.add("net.do");
        TWO_LEVEL_TLD.add("sld.do");
        TWO_LEVEL_TLD.add("web.do");
        TWO_LEVEL_TLD.add("com.dz");
        TWO_LEVEL_TLD.add("org.dz");
        TWO_LEVEL_TLD.add("net.dz");
        TWO_LEVEL_TLD.add("gov.dz");
        TWO_LEVEL_TLD.add("edu.dz");
        TWO_LEVEL_TLD.add("ass.dz");
        TWO_LEVEL_TLD.add("pol.dz");
        TWO_LEVEL_TLD.add("art.dz");
        TWO_LEVEL_TLD.add("com.ec");
        TWO_LEVEL_TLD.add("k12.ec");
        TWO_LEVEL_TLD.add("edu.ec");
        TWO_LEVEL_TLD.add("fin.ec");
        TWO_LEVEL_TLD.add("med.ec");
        TWO_LEVEL_TLD.add("gov.ec");
        TWO_LEVEL_TLD.add("mil.ec");
        TWO_LEVEL_TLD.add("org.ec");
        TWO_LEVEL_TLD.add("net.ec");
        TWO_LEVEL_TLD.add("com.ee");
        TWO_LEVEL_TLD.add("pri.ee");
        TWO_LEVEL_TLD.add("fie.ee");
        TWO_LEVEL_TLD.add("org.ee");
        TWO_LEVEL_TLD.add("med.ee");
        TWO_LEVEL_TLD.add("com.eg");
        TWO_LEVEL_TLD.add("edu.eg");
        TWO_LEVEL_TLD.add("eun.eg");
        TWO_LEVEL_TLD.add("gov.eg");
        TWO_LEVEL_TLD.add("net.eg");
        TWO_LEVEL_TLD.add("org.eg");
        TWO_LEVEL_TLD.add("sci.eg");
        TWO_LEVEL_TLD.add("com.er");
        TWO_LEVEL_TLD.add("net.er");
        TWO_LEVEL_TLD.add("org.er");
        TWO_LEVEL_TLD.add("edu.er");
        TWO_LEVEL_TLD.add("mil.er");
        TWO_LEVEL_TLD.add("gov.er");
        TWO_LEVEL_TLD.add("ind.er");
        TWO_LEVEL_TLD.add("com.es");
        TWO_LEVEL_TLD.add("org.es");
        TWO_LEVEL_TLD.add("gob.es");
        TWO_LEVEL_TLD.add("edu.es");
        TWO_LEVEL_TLD.add("nom.es");
        TWO_LEVEL_TLD.add("com.et");
        TWO_LEVEL_TLD.add("gov.et");
        TWO_LEVEL_TLD.add("org.et");
        TWO_LEVEL_TLD.add("edu.et");
        TWO_LEVEL_TLD.add("net.et");
        TWO_LEVEL_TLD.add("biz.et");
        TWO_LEVEL_TLD.add("name.et");
        TWO_LEVEL_TLD.add("info.et");
        TWO_LEVEL_TLD.add("ac.fj");
        TWO_LEVEL_TLD.add("com.fj");
        TWO_LEVEL_TLD.add("gov.fj");
        TWO_LEVEL_TLD.add("id.fj");
        TWO_LEVEL_TLD.add("org.fj");
        TWO_LEVEL_TLD.add("school.fj");
        TWO_LEVEL_TLD.add("com.fk");
        TWO_LEVEL_TLD.add("ac.fk");
        TWO_LEVEL_TLD.add("gov.fk");
        TWO_LEVEL_TLD.add("net.fk");
        TWO_LEVEL_TLD.add("nom.fk");
        TWO_LEVEL_TLD.add("org.fk");
        TWO_LEVEL_TLD.add("asso.fr");
        TWO_LEVEL_TLD.add("nom.fr");
        TWO_LEVEL_TLD.add("barreau.fr");
        TWO_LEVEL_TLD.add("com.fr");
        TWO_LEVEL_TLD.add("prd.fr");
        TWO_LEVEL_TLD.add("presse.fr");
        TWO_LEVEL_TLD.add("tm.fr");
        TWO_LEVEL_TLD.add("aeroport.fr");
        TWO_LEVEL_TLD.add("assedic.fr");
        TWO_LEVEL_TLD.add("avocat.fr");
        TWO_LEVEL_TLD.add("avoues.fr");
        TWO_LEVEL_TLD.add("cci.fr");
        TWO_LEVEL_TLD.add("chambagri.fr");
        TWO_LEVEL_TLD.add("chirurgiens-dentistes.fr");
        TWO_LEVEL_TLD.add("experts-comptables.fr");
        TWO_LEVEL_TLD.add("geometre-expert.fr");
        TWO_LEVEL_TLD.add("gouv.fr");
        TWO_LEVEL_TLD.add("greta.fr");
        TWO_LEVEL_TLD.add("huissier-justice.fr");
        TWO_LEVEL_TLD.add("medecin.fr");
        TWO_LEVEL_TLD.add("notaires.fr");
        TWO_LEVEL_TLD.add("pharmacien.fr");
        TWO_LEVEL_TLD.add("port.fr");
        TWO_LEVEL_TLD.add("veterinaire.fr");
        TWO_LEVEL_TLD.add("com.ge");
        TWO_LEVEL_TLD.add("edu.ge");
        TWO_LEVEL_TLD.add("gov.ge");
        TWO_LEVEL_TLD.add("mil.ge");
        TWO_LEVEL_TLD.add("net.ge");
        TWO_LEVEL_TLD.add("org.ge");
        TWO_LEVEL_TLD.add("pvt.ge");
        TWO_LEVEL_TLD.add("co.gg");
        TWO_LEVEL_TLD.add("org.gg");
        TWO_LEVEL_TLD.add("sch.gg");
        TWO_LEVEL_TLD.add("ac.gg");
        TWO_LEVEL_TLD.add("gov.gg");
        TWO_LEVEL_TLD.add("ltd.gg");
        TWO_LEVEL_TLD.add("ind.gg");
        TWO_LEVEL_TLD.add("net.gg");
        TWO_LEVEL_TLD.add("alderney.gg");
        TWO_LEVEL_TLD.add("guernsey.gg");
        TWO_LEVEL_TLD.add("sark.gg");
        TWO_LEVEL_TLD.add("com.gr");
        TWO_LEVEL_TLD.add("edu.gr");
        TWO_LEVEL_TLD.add("gov.gr");
        TWO_LEVEL_TLD.add("net.gr");
        TWO_LEVEL_TLD.add("org.gr");
        TWO_LEVEL_TLD.add("com.gt");
        TWO_LEVEL_TLD.add("edu.gt");
        TWO_LEVEL_TLD.add("net.gt");
        TWO_LEVEL_TLD.add("gob.gt");
        TWO_LEVEL_TLD.add("org.gt");
        TWO_LEVEL_TLD.add("mil.gt");
        TWO_LEVEL_TLD.add("ind.gt");
        TWO_LEVEL_TLD.add("com.gu");
        TWO_LEVEL_TLD.add("edu.gu");
        TWO_LEVEL_TLD.add("net.gu");
        TWO_LEVEL_TLD.add("org.gu");
        TWO_LEVEL_TLD.add("gov.gu");
        TWO_LEVEL_TLD.add("mil.gu");
        TWO_LEVEL_TLD.add("com.hk");
        TWO_LEVEL_TLD.add("net.hk");
        TWO_LEVEL_TLD.add("org.hk");
        TWO_LEVEL_TLD.add("idv.hk");
        TWO_LEVEL_TLD.add("gov.hk");
        TWO_LEVEL_TLD.add("edu.hk");
        TWO_LEVEL_TLD.add("co.hu");
        TWO_LEVEL_TLD.add("2000.hu");
        TWO_LEVEL_TLD.add("erotika.hu");
        TWO_LEVEL_TLD.add("jogasz.hu");
        TWO_LEVEL_TLD.add("sex.hu");
        TWO_LEVEL_TLD.add("video.hu");
        TWO_LEVEL_TLD.add("info.hu");
        TWO_LEVEL_TLD.add("agrar.hu");
        TWO_LEVEL_TLD.add("film.hu");
        TWO_LEVEL_TLD.add("konyvelo.hu");
        TWO_LEVEL_TLD.add("shop.hu");
        TWO_LEVEL_TLD.add("org.hu");
        TWO_LEVEL_TLD.add("bolt.hu");
        TWO_LEVEL_TLD.add("forum.hu");
        TWO_LEVEL_TLD.add("lakas.hu");
        TWO_LEVEL_TLD.add("suli.hu");
        TWO_LEVEL_TLD.add("priv.hu");
        TWO_LEVEL_TLD.add("casino.hu");
        TWO_LEVEL_TLD.add("games.hu");
        TWO_LEVEL_TLD.add("media.hu");
        TWO_LEVEL_TLD.add("szex.hu");
        TWO_LEVEL_TLD.add("sport.hu");
        TWO_LEVEL_TLD.add("city.hu");
        TWO_LEVEL_TLD.add("hotel.hu");
        TWO_LEVEL_TLD.add("news.hu");
        TWO_LEVEL_TLD.add("tozsde.hu");
        TWO_LEVEL_TLD.add("tm.hu");
        TWO_LEVEL_TLD.add("erotica.hu");
        TWO_LEVEL_TLD.add("ingatlan.hu");
        TWO_LEVEL_TLD.add("reklam.hu");
        TWO_LEVEL_TLD.add("utazas.hu");
        TWO_LEVEL_TLD.add("ac.id");
        TWO_LEVEL_TLD.add("co.id");
        TWO_LEVEL_TLD.add("go.id");
        TWO_LEVEL_TLD.add("mil.id");
        TWO_LEVEL_TLD.add("net.id");
        TWO_LEVEL_TLD.add("or.id");
        TWO_LEVEL_TLD.add("co.il");
        TWO_LEVEL_TLD.add("net.il");
        TWO_LEVEL_TLD.add("org.il");
        TWO_LEVEL_TLD.add("ac.il");
        TWO_LEVEL_TLD.add("gov.il");
        TWO_LEVEL_TLD.add("k12.il");
        TWO_LEVEL_TLD.add("muni.il");
        TWO_LEVEL_TLD.add("idf.il");
        TWO_LEVEL_TLD.add("co.im");
        TWO_LEVEL_TLD.add("net.im");
        TWO_LEVEL_TLD.add("org.im");
        TWO_LEVEL_TLD.add("ac.im");
        TWO_LEVEL_TLD.add("lkd.co.im");
        TWO_LEVEL_TLD.add("gov.im");
        TWO_LEVEL_TLD.add("nic.im");
        TWO_LEVEL_TLD.add("plc.co.im");
        TWO_LEVEL_TLD.add("co.in");
        TWO_LEVEL_TLD.add("net.in");
        TWO_LEVEL_TLD.add("ac.in");
        TWO_LEVEL_TLD.add("ernet.in");
        TWO_LEVEL_TLD.add("gov.in");
        TWO_LEVEL_TLD.add("nic.in");
        TWO_LEVEL_TLD.add("res.in");
        TWO_LEVEL_TLD.add("gen.in");
        TWO_LEVEL_TLD.add("firm.in");
        TWO_LEVEL_TLD.add("mil.in");
        TWO_LEVEL_TLD.add("org.in");
        TWO_LEVEL_TLD.add("ind.in");
        TWO_LEVEL_TLD.add("ac.ir");
        TWO_LEVEL_TLD.add("co.ir");
        TWO_LEVEL_TLD.add("gov.ir");
        TWO_LEVEL_TLD.add("id.ir");
        TWO_LEVEL_TLD.add("net.ir");
        TWO_LEVEL_TLD.add("org.ir");
        TWO_LEVEL_TLD.add("sch.ir");
        TWO_LEVEL_TLD.add("ac.je");
        TWO_LEVEL_TLD.add("co.je");
        TWO_LEVEL_TLD.add("net.je");
        TWO_LEVEL_TLD.add("org.je");
        TWO_LEVEL_TLD.add("gov.je");
        TWO_LEVEL_TLD.add("ind.je");
        TWO_LEVEL_TLD.add("jersey.je");
        TWO_LEVEL_TLD.add("ltd.je");
        TWO_LEVEL_TLD.add("sch.je");
        TWO_LEVEL_TLD.add("com.jo");
        TWO_LEVEL_TLD.add("org.jo");
        TWO_LEVEL_TLD.add("net.jo");
        TWO_LEVEL_TLD.add("gov.jo");
        TWO_LEVEL_TLD.add("edu.jo");
        TWO_LEVEL_TLD.add("mil.jo");
        TWO_LEVEL_TLD.add("ad.jp");
        TWO_LEVEL_TLD.add("ac.jp");
        TWO_LEVEL_TLD.add("co.jp");
        TWO_LEVEL_TLD.add("go.jp");
        TWO_LEVEL_TLD.add("or.jp");
        TWO_LEVEL_TLD.add("ne.jp");
        TWO_LEVEL_TLD.add("gr.jp");
        TWO_LEVEL_TLD.add("ed.jp");
        TWO_LEVEL_TLD.add("lg.jp");
        TWO_LEVEL_TLD.add("net.jp");
        TWO_LEVEL_TLD.add("org.jp");
        TWO_LEVEL_TLD.add("gov.jp");
        TWO_LEVEL_TLD.add("hokkaido.jp");
        TWO_LEVEL_TLD.add("aomori.jp");
        TWO_LEVEL_TLD.add("iwate.jp");
        TWO_LEVEL_TLD.add("miyagi.jp");
        TWO_LEVEL_TLD.add("akita.jp");
        TWO_LEVEL_TLD.add("yamagata.jp");
        TWO_LEVEL_TLD.add("fukushima.jp");
        TWO_LEVEL_TLD.add("ibaraki.jp");
        TWO_LEVEL_TLD.add("tochigi.jp");
        TWO_LEVEL_TLD.add("gunma.jp");
        TWO_LEVEL_TLD.add("saitama.jp");
        TWO_LEVEL_TLD.add("chiba.jp");
        TWO_LEVEL_TLD.add("tokyo.jp");
        TWO_LEVEL_TLD.add("kanagawa.jp");
        TWO_LEVEL_TLD.add("niigata.jp");
        TWO_LEVEL_TLD.add("toyama.jp");
        TWO_LEVEL_TLD.add("ishikawa.jp");
        TWO_LEVEL_TLD.add("fukui.jp");
        TWO_LEVEL_TLD.add("yamanashi.jp");
        TWO_LEVEL_TLD.add("nagano.jp");
        TWO_LEVEL_TLD.add("gifu.jp");
        TWO_LEVEL_TLD.add("shizuoka.jp");
        TWO_LEVEL_TLD.add("aichi.jp");
        TWO_LEVEL_TLD.add("mie.jp");
        TWO_LEVEL_TLD.add("shiga.jp");
        TWO_LEVEL_TLD.add("kyoto.jp");
        TWO_LEVEL_TLD.add("osaka.jp");
        TWO_LEVEL_TLD.add("hyogo.jp");
        TWO_LEVEL_TLD.add("nara.jp");
        TWO_LEVEL_TLD.add("wakayama.jp");
        TWO_LEVEL_TLD.add("tottori.jp");
        TWO_LEVEL_TLD.add("shimane.jp");
        TWO_LEVEL_TLD.add("okayama.jp");
        TWO_LEVEL_TLD.add("hiroshima.jp");
        TWO_LEVEL_TLD.add("yamaguchi.jp");
        TWO_LEVEL_TLD.add("tokushima.jp");
        TWO_LEVEL_TLD.add("kagawa.jp");
        TWO_LEVEL_TLD.add("ehime.jp");
        TWO_LEVEL_TLD.add("kochi.jp");
        TWO_LEVEL_TLD.add("fukuoka.jp");
        TWO_LEVEL_TLD.add("saga.jp");
        TWO_LEVEL_TLD.add("nagasaki.jp");
        TWO_LEVEL_TLD.add("kumamoto.jp");
        TWO_LEVEL_TLD.add("oita.jp");
        TWO_LEVEL_TLD.add("miyazaki.jp");
        TWO_LEVEL_TLD.add("kagoshima.jp");
        TWO_LEVEL_TLD.add("okinawa.jp");
        TWO_LEVEL_TLD.add("sapporo.jp");
        TWO_LEVEL_TLD.add("sendai.jp");
        TWO_LEVEL_TLD.add("yokohama.jp");
        TWO_LEVEL_TLD.add("kawasaki.jp");
        TWO_LEVEL_TLD.add("nagoya.jp");
        TWO_LEVEL_TLD.add("kobe.jp");
        TWO_LEVEL_TLD.add("kitakyushu.jp");
        TWO_LEVEL_TLD.add("utsunomiya.jp");
        TWO_LEVEL_TLD.add("kanazawa.jp");
        TWO_LEVEL_TLD.add("takamatsu.jp");
        TWO_LEVEL_TLD.add("matsuyama.jp");
        TWO_LEVEL_TLD.add("com.kh");
        TWO_LEVEL_TLD.add("net.kh");
        TWO_LEVEL_TLD.add("org.kh");
        TWO_LEVEL_TLD.add("per.kh");
        TWO_LEVEL_TLD.add("edu.kh");
        TWO_LEVEL_TLD.add("gov.kh");
        TWO_LEVEL_TLD.add("mil.kh");
        TWO_LEVEL_TLD.add("ac.kr");
        TWO_LEVEL_TLD.add("co.kr");
        TWO_LEVEL_TLD.add("go.kr");
        TWO_LEVEL_TLD.add("ne.kr");
        TWO_LEVEL_TLD.add("or.kr");
        TWO_LEVEL_TLD.add("pe.kr");
        TWO_LEVEL_TLD.add("re.kr");
        TWO_LEVEL_TLD.add("seoul.kr");
        TWO_LEVEL_TLD.add("kyonggi.kr");
        TWO_LEVEL_TLD.add("com.kw");
        TWO_LEVEL_TLD.add("net.kw");
        TWO_LEVEL_TLD.add("org.kw");
        TWO_LEVEL_TLD.add("edu.kw");
        TWO_LEVEL_TLD.add("gov.kw");
        TWO_LEVEL_TLD.add("com.la");
        TWO_LEVEL_TLD.add("net.la");
        TWO_LEVEL_TLD.add("org.la");
        TWO_LEVEL_TLD.add("com.lb");
        TWO_LEVEL_TLD.add("org.lb");
        TWO_LEVEL_TLD.add("net.lb");
        TWO_LEVEL_TLD.add("edu.lb");
        TWO_LEVEL_TLD.add("gov.lb");
        TWO_LEVEL_TLD.add("mil.lb");
        TWO_LEVEL_TLD.add("com.lc");
        TWO_LEVEL_TLD.add("edu.lc");
        TWO_LEVEL_TLD.add("gov.lc");
        TWO_LEVEL_TLD.add("net.lc");
        TWO_LEVEL_TLD.add("org.lc");
        TWO_LEVEL_TLD.add("com.lv");
        TWO_LEVEL_TLD.add("net.lv");
        TWO_LEVEL_TLD.add("org.lv");
        TWO_LEVEL_TLD.add("edu.lv");
        TWO_LEVEL_TLD.add("gov.lv");
        TWO_LEVEL_TLD.add("mil.lv");
        TWO_LEVEL_TLD.add("id.lv");
        TWO_LEVEL_TLD.add("asn.lv");
        TWO_LEVEL_TLD.add("conf.lv");
        TWO_LEVEL_TLD.add("com.ly");
        TWO_LEVEL_TLD.add("net.ly");
        TWO_LEVEL_TLD.add("org.ly");
        TWO_LEVEL_TLD.add("co.ma");
        TWO_LEVEL_TLD.add("net.ma");
        TWO_LEVEL_TLD.add("org.ma");
        TWO_LEVEL_TLD.add("press.ma");
        TWO_LEVEL_TLD.add("ac.ma");
        TWO_LEVEL_TLD.add("com.mk");
        TWO_LEVEL_TLD.add("com.mm");
        TWO_LEVEL_TLD.add("net.mm");
        TWO_LEVEL_TLD.add("org.mm");
        TWO_LEVEL_TLD.add("edu.mm");
        TWO_LEVEL_TLD.add("gov.mm");
        TWO_LEVEL_TLD.add("com.mn");
        TWO_LEVEL_TLD.add("org.mn");
        TWO_LEVEL_TLD.add("edu.mn");
        TWO_LEVEL_TLD.add("gov.mn");
        TWO_LEVEL_TLD.add("museum.mn");
        TWO_LEVEL_TLD.add("com.mo");
        TWO_LEVEL_TLD.add("net.mo");
        TWO_LEVEL_TLD.add("org.mo");
        TWO_LEVEL_TLD.add("edu.mo");
        TWO_LEVEL_TLD.add("gov.mo");
        TWO_LEVEL_TLD.add("com.mt");
        TWO_LEVEL_TLD.add("net.mt");
        TWO_LEVEL_TLD.add("org.mt");
        TWO_LEVEL_TLD.add("edu.mt");
        TWO_LEVEL_TLD.add("tm.mt");
        TWO_LEVEL_TLD.add("uu.mt");
        TWO_LEVEL_TLD.add("com.mx");
        TWO_LEVEL_TLD.add("net.mx");
        TWO_LEVEL_TLD.add("org.mx");
        TWO_LEVEL_TLD.add("gob.mx");
        TWO_LEVEL_TLD.add("edu.mx");
        TWO_LEVEL_TLD.add("com.my");
        TWO_LEVEL_TLD.add("org.my");
        TWO_LEVEL_TLD.add("gov.my");
        TWO_LEVEL_TLD.add("edu.my");
        TWO_LEVEL_TLD.add("net.my");
        TWO_LEVEL_TLD.add("com.na");
        TWO_LEVEL_TLD.add("org.na");
        TWO_LEVEL_TLD.add("net.na");
        TWO_LEVEL_TLD.add("alt.na");
        TWO_LEVEL_TLD.add("edu.na");
        TWO_LEVEL_TLD.add("cul.na");
        TWO_LEVEL_TLD.add("unam.na");
        TWO_LEVEL_TLD.add("telecom.na");
        TWO_LEVEL_TLD.add("com.nc");
        TWO_LEVEL_TLD.add("net.nc");
        TWO_LEVEL_TLD.add("org.nc");
        TWO_LEVEL_TLD.add("ac.ng");
        TWO_LEVEL_TLD.add("edu.ng");
        TWO_LEVEL_TLD.add("sch.ng");
        TWO_LEVEL_TLD.add("com.ng");
        TWO_LEVEL_TLD.add("gov.ng");
        TWO_LEVEL_TLD.add("org.ng");
        TWO_LEVEL_TLD.add("net.ng");
        TWO_LEVEL_TLD.add("gob.ni");
        TWO_LEVEL_TLD.add("com.ni");
        TWO_LEVEL_TLD.add("net.ni");
        TWO_LEVEL_TLD.add("edu.ni");
        TWO_LEVEL_TLD.add("nom.ni");
        TWO_LEVEL_TLD.add("org.ni");
        TWO_LEVEL_TLD.add("com.np");
        TWO_LEVEL_TLD.add("net.np");
        TWO_LEVEL_TLD.add("org.np");
        TWO_LEVEL_TLD.add("gov.np");
        TWO_LEVEL_TLD.add("edu.np");
        TWO_LEVEL_TLD.add("ac.nz");
        TWO_LEVEL_TLD.add("co.nz");
        TWO_LEVEL_TLD.add("cri.nz");
        TWO_LEVEL_TLD.add("gen.nz");
        TWO_LEVEL_TLD.add("geek.nz");
        TWO_LEVEL_TLD.add("govt.nz");
        TWO_LEVEL_TLD.add("iwi.nz");
        TWO_LEVEL_TLD.add("maori.nz");
        TWO_LEVEL_TLD.add("mil.nz");
        TWO_LEVEL_TLD.add("net.nz");
        TWO_LEVEL_TLD.add("org.nz");
        TWO_LEVEL_TLD.add("school.nz");
        TWO_LEVEL_TLD.add("com.om");
        TWO_LEVEL_TLD.add("co.om");
        TWO_LEVEL_TLD.add("edu.om");
        TWO_LEVEL_TLD.add("ac.om");
        TWO_LEVEL_TLD.add("gov.om");
        TWO_LEVEL_TLD.add("net.om");
        TWO_LEVEL_TLD.add("org.om");
        TWO_LEVEL_TLD.add("mod.om");
        TWO_LEVEL_TLD.add("museum.om");
        TWO_LEVEL_TLD.add("biz.om");
        TWO_LEVEL_TLD.add("pro.om");
        TWO_LEVEL_TLD.add("med.om");
        TWO_LEVEL_TLD.add("com.pa");
        TWO_LEVEL_TLD.add("net.pa");
        TWO_LEVEL_TLD.add("org.pa");
        TWO_LEVEL_TLD.add("edu.pa");
        TWO_LEVEL_TLD.add("ac.pa");
        TWO_LEVEL_TLD.add("gob.pa");
        TWO_LEVEL_TLD.add("sld.pa");
        TWO_LEVEL_TLD.add("edu.pe");
        TWO_LEVEL_TLD.add("gob.pe");
        TWO_LEVEL_TLD.add("nom.pe");
        TWO_LEVEL_TLD.add("mil.pe");
        TWO_LEVEL_TLD.add("org.pe");
        TWO_LEVEL_TLD.add("com.pe");
        TWO_LEVEL_TLD.add("net.pe");
        TWO_LEVEL_TLD.add("com.pg");
        TWO_LEVEL_TLD.add("net.pg");
        TWO_LEVEL_TLD.add("ac.pg");
        TWO_LEVEL_TLD.add("com.ph");
        TWO_LEVEL_TLD.add("net.ph");
        TWO_LEVEL_TLD.add("org.ph");
        TWO_LEVEL_TLD.add("mil.ph");
        TWO_LEVEL_TLD.add("ngo.ph");
        TWO_LEVEL_TLD.add("aid.pl");
        TWO_LEVEL_TLD.add("agro.pl");
        TWO_LEVEL_TLD.add("atm.pl");
        TWO_LEVEL_TLD.add("auto.pl");
        TWO_LEVEL_TLD.add("biz.pl");
        TWO_LEVEL_TLD.add("com.pl");
        TWO_LEVEL_TLD.add("edu.pl");
        TWO_LEVEL_TLD.add("gmina.pl");
        TWO_LEVEL_TLD.add("gsm.pl");
        TWO_LEVEL_TLD.add("info.pl");
        TWO_LEVEL_TLD.add("mail.pl");
        TWO_LEVEL_TLD.add("miasta.pl");
        TWO_LEVEL_TLD.add("media.pl");
        TWO_LEVEL_TLD.add("mil.pl");
        TWO_LEVEL_TLD.add("net.pl");
        TWO_LEVEL_TLD.add("nieruchomosci.pl");
        TWO_LEVEL_TLD.add("nom.pl");
        TWO_LEVEL_TLD.add("org.pl");
        TWO_LEVEL_TLD.add("pc.pl");
        TWO_LEVEL_TLD.add("powiat.pl");
        TWO_LEVEL_TLD.add("priv.pl");
        TWO_LEVEL_TLD.add("realestate.pl");
        TWO_LEVEL_TLD.add("rel.pl");
        TWO_LEVEL_TLD.add("sex.pl");
        TWO_LEVEL_TLD.add("shop.pl");
        TWO_LEVEL_TLD.add("sklep.pl");
        TWO_LEVEL_TLD.add("sos.pl");
        TWO_LEVEL_TLD.add("szkola.pl");
        TWO_LEVEL_TLD.add("targi.pl");
        TWO_LEVEL_TLD.add("tm.pl");
        TWO_LEVEL_TLD.add("tourism.pl");
        TWO_LEVEL_TLD.add("travel.pl");
        TWO_LEVEL_TLD.add("turystyka.pl");
        TWO_LEVEL_TLD.add("com.pk");
        TWO_LEVEL_TLD.add("net.pk");
        TWO_LEVEL_TLD.add("edu.pk");
        TWO_LEVEL_TLD.add("org.pk");
        TWO_LEVEL_TLD.add("fam.pk");
        TWO_LEVEL_TLD.add("biz.pk");
        TWO_LEVEL_TLD.add("web.pk");
        TWO_LEVEL_TLD.add("gov.pk");
        TWO_LEVEL_TLD.add("gob.pk");
        TWO_LEVEL_TLD.add("gok.pk");
        TWO_LEVEL_TLD.add("gon.pk");
        TWO_LEVEL_TLD.add("gop.pk");
        TWO_LEVEL_TLD.add("gos.pk");
        TWO_LEVEL_TLD.add("edu.ps");
        TWO_LEVEL_TLD.add("gov.ps");
        TWO_LEVEL_TLD.add("plo.ps");
        TWO_LEVEL_TLD.add("sec.ps");
        TWO_LEVEL_TLD.add("com.pt");
        TWO_LEVEL_TLD.add("edu.pt");
        TWO_LEVEL_TLD.add("gov.pt");
        TWO_LEVEL_TLD.add("int.pt");
        TWO_LEVEL_TLD.add("net.pt");
        TWO_LEVEL_TLD.add("nome.pt");
        TWO_LEVEL_TLD.add("org.pt");
        TWO_LEVEL_TLD.add("publ.pt");
        TWO_LEVEL_TLD.add("com.py");
        TWO_LEVEL_TLD.add("net.py");
        TWO_LEVEL_TLD.add("org.py");
        TWO_LEVEL_TLD.add("edu.py");
        TWO_LEVEL_TLD.add("com.qa");
        TWO_LEVEL_TLD.add("net.qa");
        TWO_LEVEL_TLD.add("org.qa");
        TWO_LEVEL_TLD.add("edu.qa");
        TWO_LEVEL_TLD.add("gov.qa");
        TWO_LEVEL_TLD.add("asso.re");
        TWO_LEVEL_TLD.add("com.re");
        TWO_LEVEL_TLD.add("nom.re");
        TWO_LEVEL_TLD.add("com.ro");
        TWO_LEVEL_TLD.add("org.ro");
        TWO_LEVEL_TLD.add("tm.ro");
        TWO_LEVEL_TLD.add("nt.ro");
        TWO_LEVEL_TLD.add("nom.ro");
        TWO_LEVEL_TLD.add("info.ro");
        TWO_LEVEL_TLD.add("rec.ro");
        TWO_LEVEL_TLD.add("arts.ro");
        TWO_LEVEL_TLD.add("firm.ro");
        TWO_LEVEL_TLD.add("store.ro");
        TWO_LEVEL_TLD.add("www.ro");
        TWO_LEVEL_TLD.add("com.ru");
        TWO_LEVEL_TLD.add("net.ru");
        TWO_LEVEL_TLD.add("org.ru");
        TWO_LEVEL_TLD.add("gov.ru");
        TWO_LEVEL_TLD.add("pp.ru");
        TWO_LEVEL_TLD.add("com.sa");
        TWO_LEVEL_TLD.add("edu.sa");
        TWO_LEVEL_TLD.add("sch.sa");
        TWO_LEVEL_TLD.add("med.sa");
        TWO_LEVEL_TLD.add("gov.sa");
        TWO_LEVEL_TLD.add("net.sa");
        TWO_LEVEL_TLD.add("org.sa");
        TWO_LEVEL_TLD.add("pub.sa");
        TWO_LEVEL_TLD.add("com.sb");
        TWO_LEVEL_TLD.add("net.sb");
        TWO_LEVEL_TLD.add("org.sb");
        TWO_LEVEL_TLD.add("edu.sb");
        TWO_LEVEL_TLD.add("gov.sb");
        TWO_LEVEL_TLD.add("com.sd");
        TWO_LEVEL_TLD.add("net.sd");
        TWO_LEVEL_TLD.add("org.sd");
        TWO_LEVEL_TLD.add("edu.sd");
        TWO_LEVEL_TLD.add("sch.sd");
        TWO_LEVEL_TLD.add("med.sd");
        TWO_LEVEL_TLD.add("gov.sd");
        TWO_LEVEL_TLD.add("tm.se");
        TWO_LEVEL_TLD.add("press.se");
        TWO_LEVEL_TLD.add("parti.se");
        TWO_LEVEL_TLD.add("brand.se");
        TWO_LEVEL_TLD.add("fh.se");
        TWO_LEVEL_TLD.add("fhsk.se");
        TWO_LEVEL_TLD.add("fhv.se");
        TWO_LEVEL_TLD.add("komforb.se");
        TWO_LEVEL_TLD.add("kommunalforbund.se");
        TWO_LEVEL_TLD.add("komvux.se");
        TWO_LEVEL_TLD.add("lanarb.se");
        TWO_LEVEL_TLD.add("lanbib.se");
        TWO_LEVEL_TLD.add("naturbruksgymn.se");
        TWO_LEVEL_TLD.add("sshn.se");
        TWO_LEVEL_TLD.add("org.se");
        TWO_LEVEL_TLD.add("pp.se");
        TWO_LEVEL_TLD.add("com.sg");
        TWO_LEVEL_TLD.add("net.sg");
        TWO_LEVEL_TLD.add("org.sg");
        TWO_LEVEL_TLD.add("edu.sg");
        TWO_LEVEL_TLD.add("gov.sg");
        TWO_LEVEL_TLD.add("per.sg");
        TWO_LEVEL_TLD.add("com.sh");
        TWO_LEVEL_TLD.add("net.sh");
        TWO_LEVEL_TLD.add("org.sh");
        TWO_LEVEL_TLD.add("edu.sh");
        TWO_LEVEL_TLD.add("gov.sh");
        TWO_LEVEL_TLD.add("mil.sh");
        TWO_LEVEL_TLD.add("gov.st");
        TWO_LEVEL_TLD.add("saotome.st");
        TWO_LEVEL_TLD.add("principe.st");
        TWO_LEVEL_TLD.add("consulado.st");
        TWO_LEVEL_TLD.add("embaixada.st");
        TWO_LEVEL_TLD.add("org.st");
        TWO_LEVEL_TLD.add("edu.st");
        TWO_LEVEL_TLD.add("net.st");
        TWO_LEVEL_TLD.add("com.st");
        TWO_LEVEL_TLD.add("store.st");
        TWO_LEVEL_TLD.add("mil.st");
        TWO_LEVEL_TLD.add("co.st");
        TWO_LEVEL_TLD.add("com.sv");
        TWO_LEVEL_TLD.add("org.sv");
        TWO_LEVEL_TLD.add("edu.sv");
        TWO_LEVEL_TLD.add("gob.sv");
        TWO_LEVEL_TLD.add("red.sv");
        TWO_LEVEL_TLD.add("com.sy");
        TWO_LEVEL_TLD.add("net.sy");
        TWO_LEVEL_TLD.add("org.sy");
        TWO_LEVEL_TLD.add("gov.sy");
        TWO_LEVEL_TLD.add("ac.th");
        TWO_LEVEL_TLD.add("co.th");
        TWO_LEVEL_TLD.add("go.th");
        TWO_LEVEL_TLD.add("net.th");
        TWO_LEVEL_TLD.add("or.th");
        TWO_LEVEL_TLD.add("com.tn");
        TWO_LEVEL_TLD.add("net.tn");
        TWO_LEVEL_TLD.add("org.tn");
        TWO_LEVEL_TLD.add("edunet.tn");
        TWO_LEVEL_TLD.add("gov.tn");
        TWO_LEVEL_TLD.add("ens.tn");
        TWO_LEVEL_TLD.add("fin.tn");
        TWO_LEVEL_TLD.add("nat.tn");
        TWO_LEVEL_TLD.add("ind.tn");
        TWO_LEVEL_TLD.add("info.tn");
        TWO_LEVEL_TLD.add("intl.tn");
        TWO_LEVEL_TLD.add("rnrt.tn");
        TWO_LEVEL_TLD.add("rnu.tn");
        TWO_LEVEL_TLD.add("rns.tn");
        TWO_LEVEL_TLD.add("tourism.tn");
        TWO_LEVEL_TLD.add("com.tr");
        TWO_LEVEL_TLD.add("net.tr");
        TWO_LEVEL_TLD.add("org.tr");
        TWO_LEVEL_TLD.add("edu.tr");
        TWO_LEVEL_TLD.add("gov.tr");
        TWO_LEVEL_TLD.add("mil.tr");
        TWO_LEVEL_TLD.add("bbs.tr");
        TWO_LEVEL_TLD.add("k12.tr");
        TWO_LEVEL_TLD.add("gen.tr");
        TWO_LEVEL_TLD.add("co.tt");
        TWO_LEVEL_TLD.add("com.tt");
        TWO_LEVEL_TLD.add("org.tt");
        TWO_LEVEL_TLD.add("net.tt");
        TWO_LEVEL_TLD.add("biz.tt");
        TWO_LEVEL_TLD.add("info.tt");
        TWO_LEVEL_TLD.add("pro.tt");
        TWO_LEVEL_TLD.add("int.tt");
        TWO_LEVEL_TLD.add("coop.tt");
        TWO_LEVEL_TLD.add("jobs.tt");
        TWO_LEVEL_TLD.add("mobi.tt");
        TWO_LEVEL_TLD.add("travel.tt");
        TWO_LEVEL_TLD.add("museum.tt");
        TWO_LEVEL_TLD.add("aero.tt");
        TWO_LEVEL_TLD.add("name.tt");
        TWO_LEVEL_TLD.add("gov.tt");
        TWO_LEVEL_TLD.add("edu.tt");
        TWO_LEVEL_TLD.add("nic.tt");
        TWO_LEVEL_TLD.add("us.tt");
        TWO_LEVEL_TLD.add("uk.tt");
        TWO_LEVEL_TLD.add("ca.tt");
        TWO_LEVEL_TLD.add("eu.tt");
        TWO_LEVEL_TLD.add("es.tt");
        TWO_LEVEL_TLD.add("fr.tt");
        TWO_LEVEL_TLD.add("it.tt");
        TWO_LEVEL_TLD.add("se.tt");
        TWO_LEVEL_TLD.add("dk.tt");
        TWO_LEVEL_TLD.add("be.tt");
        TWO_LEVEL_TLD.add("de.tt");
        TWO_LEVEL_TLD.add("at.tt");
        TWO_LEVEL_TLD.add("au.tt");
        TWO_LEVEL_TLD.add("co.tv");
        TWO_LEVEL_TLD.add("com.tw");
        TWO_LEVEL_TLD.add("net.tw");
        TWO_LEVEL_TLD.add("org.tw");
        TWO_LEVEL_TLD.add("edu.tw");
        TWO_LEVEL_TLD.add("idv.tw");
        TWO_LEVEL_TLD.add("gov.tw");
        TWO_LEVEL_TLD.add("com.ua");
        TWO_LEVEL_TLD.add("net.ua");
        TWO_LEVEL_TLD.add("org.ua");
        TWO_LEVEL_TLD.add("edu.ua");
        TWO_LEVEL_TLD.add("gov.ua");
        TWO_LEVEL_TLD.add("ac.ug");
        TWO_LEVEL_TLD.add("co.ug");
        TWO_LEVEL_TLD.add("or.ug");
        TWO_LEVEL_TLD.add("go.ug");
        TWO_LEVEL_TLD.add("co.uk");
        TWO_LEVEL_TLD.add("me.uk");
        TWO_LEVEL_TLD.add("org.uk");
        TWO_LEVEL_TLD.add("edu.uk");
        TWO_LEVEL_TLD.add("ltd.uk");
        TWO_LEVEL_TLD.add("plc.uk");
        TWO_LEVEL_TLD.add("net.uk");
        TWO_LEVEL_TLD.add("sch.uk");
        TWO_LEVEL_TLD.add("nic.uk");
        TWO_LEVEL_TLD.add("ac.uk");
        TWO_LEVEL_TLD.add("gov.uk");
        TWO_LEVEL_TLD.add("nhs.uk");
        TWO_LEVEL_TLD.add("police.uk");
        TWO_LEVEL_TLD.add("mod.uk");
        TWO_LEVEL_TLD.add("dni.us");
        TWO_LEVEL_TLD.add("fed.us");
        TWO_LEVEL_TLD.add("com.uy");
        TWO_LEVEL_TLD.add("edu.uy");
        TWO_LEVEL_TLD.add("net.uy");
        TWO_LEVEL_TLD.add("org.uy");
        TWO_LEVEL_TLD.add("gub.uy");
        TWO_LEVEL_TLD.add("mil.uy");
        TWO_LEVEL_TLD.add("com.ve");
        TWO_LEVEL_TLD.add("net.ve");
        TWO_LEVEL_TLD.add("org.ve");
        TWO_LEVEL_TLD.add("co.ve");
        TWO_LEVEL_TLD.add("edu.ve");
        TWO_LEVEL_TLD.add("gov.ve");
        TWO_LEVEL_TLD.add("mil.ve");
        TWO_LEVEL_TLD.add("arts.ve");
        TWO_LEVEL_TLD.add("bib.ve");
        TWO_LEVEL_TLD.add("firm.ve");
        TWO_LEVEL_TLD.add("info.ve");
        TWO_LEVEL_TLD.add("int.ve");
        TWO_LEVEL_TLD.add("nom.ve");
        TWO_LEVEL_TLD.add("rec.ve");
        TWO_LEVEL_TLD.add("store.ve");
        TWO_LEVEL_TLD.add("tec.ve");
        TWO_LEVEL_TLD.add("web.ve");
        TWO_LEVEL_TLD.add("co.vi");
        TWO_LEVEL_TLD.add("net.vi");
        TWO_LEVEL_TLD.add("org.vi");
        TWO_LEVEL_TLD.add("com.vn");
        TWO_LEVEL_TLD.add("biz.vn");
        TWO_LEVEL_TLD.add("edu.vn");
        TWO_LEVEL_TLD.add("gov.vn");
        TWO_LEVEL_TLD.add("net.vn");
        TWO_LEVEL_TLD.add("org.vn");
        TWO_LEVEL_TLD.add("int.vn");
        TWO_LEVEL_TLD.add("ac.vn");
        TWO_LEVEL_TLD.add("pro.vn");
        TWO_LEVEL_TLD.add("info.vn");
        TWO_LEVEL_TLD.add("health.vn");
        TWO_LEVEL_TLD.add("name.vn");
        TWO_LEVEL_TLD.add("com.vu");
        TWO_LEVEL_TLD.add("edu.vu");
        TWO_LEVEL_TLD.add("net.vu");
        TWO_LEVEL_TLD.add("org.vu");
        TWO_LEVEL_TLD.add("de.vu");
        TWO_LEVEL_TLD.add("ch.vu");
        TWO_LEVEL_TLD.add("fr.vu");
        TWO_LEVEL_TLD.add("com.ws");
        TWO_LEVEL_TLD.add("net.ws");
        TWO_LEVEL_TLD.add("org.ws");
        TWO_LEVEL_TLD.add("gov.ws");
        TWO_LEVEL_TLD.add("edu.ws");
        TWO_LEVEL_TLD.add("ac.yu");
        TWO_LEVEL_TLD.add("co.yu");
        TWO_LEVEL_TLD.add("edu.yu");
        TWO_LEVEL_TLD.add("org.yu");
        TWO_LEVEL_TLD.add("com.ye");
        TWO_LEVEL_TLD.add("net.ye");
        TWO_LEVEL_TLD.add("org.ye");
        TWO_LEVEL_TLD.add("gov.ye");
        TWO_LEVEL_TLD.add("edu.ye");
        TWO_LEVEL_TLD.add("mil.ye");
        TWO_LEVEL_TLD.add("ac.za");
        TWO_LEVEL_TLD.add("alt.za");
        TWO_LEVEL_TLD.add("bourse.za");
        TWO_LEVEL_TLD.add("city.za");
        TWO_LEVEL_TLD.add("co.za");
        TWO_LEVEL_TLD.add("edu.za");
        TWO_LEVEL_TLD.add("gov.za");
        TWO_LEVEL_TLD.add("law.za");
        TWO_LEVEL_TLD.add("mil.za");
        TWO_LEVEL_TLD.add("net.za");
        TWO_LEVEL_TLD.add("ngo.za");
        TWO_LEVEL_TLD.add("nom.za");
        TWO_LEVEL_TLD.add("org.za");
        TWO_LEVEL_TLD.add("school.za");
        TWO_LEVEL_TLD.add("tm.za");
        TWO_LEVEL_TLD.add("web.za");
        TWO_LEVEL_TLD.add("co.zw");
        TWO_LEVEL_TLD.add("ac.zw");
        TWO_LEVEL_TLD.add("org.zw");
        TWO_LEVEL_TLD.add("gov.zw");
        TWO_LEVEL_TLD.add("eu.org");
        TWO_LEVEL_TLD.add("au.com");
        TWO_LEVEL_TLD.add("br.com");
        TWO_LEVEL_TLD.add("cn.com");
        TWO_LEVEL_TLD.add("de.com");
        TWO_LEVEL_TLD.add("de.net");
        TWO_LEVEL_TLD.add("eu.com");
        TWO_LEVEL_TLD.add("gb.com");
        TWO_LEVEL_TLD.add("gb.net");
        TWO_LEVEL_TLD.add("hu.com");
        TWO_LEVEL_TLD.add("no.com");
        TWO_LEVEL_TLD.add("qc.com");
        TWO_LEVEL_TLD.add("ru.com");
        TWO_LEVEL_TLD.add("sa.com");
        TWO_LEVEL_TLD.add("se.com");
        TWO_LEVEL_TLD.add("uk.com");
        TWO_LEVEL_TLD.add("uk.net");
        TWO_LEVEL_TLD.add("us.com");
        TWO_LEVEL_TLD.add("uy.com");
        TWO_LEVEL_TLD.add("za.com");
        TWO_LEVEL_TLD.add("dk.org");
        TWO_LEVEL_TLD.add("tel.no");
        TWO_LEVEL_TLD.add("fax.nr");
        TWO_LEVEL_TLD.add("mob.nr");
        TWO_LEVEL_TLD.add("mobil.nr");
        TWO_LEVEL_TLD.add("mobile.nr");
        TWO_LEVEL_TLD.add("tel.nr");
        TWO_LEVEL_TLD.add("tlf.nr");
        TWO_LEVEL_TLD.add("e164.arpa");

        //
        // generic tlds
        //

        //
        // The .aero domain is reserved for members of the air-transport industry and is sponsored by Societe
        // Internationale de Telecommunications Aronautiques (SITA).
        //
        TLDS.add("aero");
        //
        // The .biz domain is restricted to businesses and is operated by NeuLevel, Inc.
        //
        TLDS.add("biz");
        //
        // The .cat domain is reserved for the Catalan linguistic and cultural community and is sponsored
        // by Fundacio puntCat
        //
        TLDS.add("cat");
        //
        // The .com domain is operated by VeriSign Global Registry Services.
        //
        TLDS.add("com");
        //
        // The .coop domain is reserved for cooperative associations and is sponsored by Dot Cooperation LLC.
        //
        TLDS.add("coop");
        //
        // The .info domain is operated by Afilias Limited.
        //
        TLDS.add("info");
        //
        // The .jobs domain is reserved for human resource managers and is sponsored by Employ Media LLC.
        //
        TLDS.add("jobs");
        //
        // The .mobi domain is reserved for consumers and providers of mobile products and services and is
        // sponsored by mTLD Top Level Domain, Ltd.
        //
        TLDS.add("mobi");
        //
        // The .museum domain is reserved for museums and is sponsored by the Museum Domain Management Association.
        //
        TLDS.add("museum");
        //
        // The .name domain is reserved for individuals and is operated by Global Name Registry.
        //
        TLDS.add("name");
        //
        // The .net domain is operated by VeriSign Global Registry Services.
        //
        TLDS.add("net");
        //
        // The .org domain is operated by Public Interest Registry. It is intended to serve the noncommercial
        // community, but all are eligible to register within .org.
        //
        TLDS.add("org");
        //
        // The .pro domain is restricted to credentialed professionals and related entities and is operated
        // by RegistryPro.
        //
        TLDS.add("pro");
        //
        // The .travel domain is reserved for entities whose primary area of activity is in the travel industry
        // and is sponsored by Tralliance Corporation.
        //
        TLDS.add("travel");
        //
        // The .gov domain is reserved exclusively for the United States Government. It is operated by the US
        // General Services Administration.
        //
        TLDS.add("gov");
        //
        // The .edu domain is reserved for postsecondary institutions accredited by an agency on the
        // U.S. Department of Education's list of Nationally Recognized Accrediting Agencies and is
        // registered only through Educause.
        //
        TLDS.add("edu");
        //
        // The .mil domain is reserved exclusively for the United States Military.
        // It is operated by the US DoD Network Information Center.
        //
        TLDS.add("mil");
        //
        // The .int domain is used only for registering organizations established by international treaties between
        // governments. It is operated by the IANA .int Domain Registry.
        //
        TLDS.add("int");
    }

    /**
     * returns true if the code passed is a country-code specific TLD
     *
     * @param code code
     * @return <code>true</code> if code is a country top level domain, <code>false</code> otherwise
     */
    public static boolean isCountryTLD(String code)
    {
        return COUNTRY_TLDS.contains(code);
    }

    /**
     * returns true if the hostname passed (without subdomain) is a two-level
     * TLD such as co.uk
     *
     * @param partialHostname partial host name
     * @return <code>true</code> if the partial hostname is a two-level top level domain
     */
    public static boolean isTwoLevelTLD(String partialHostname)
    {
        return TWO_LEVEL_TLD.contains(partialHostname);
    }


    /**
     * constructs absolute url from base and source
     *
     * @param base base url
     * @param src  source
     * @return absolute url
     * @throws Exception upon error
     */
    public static URL getAbsoluteURL(URL base, String src) throws Exception
    {
        if (src.length() > 0)
        {
            if (src.charAt(0) == '/')
            {
                return new URL(getRootPath(base) + src.substring(1));
            }
            else if (src.charAt(0) == '?')
            {
                URL p = URLUtil.getAbsoluteURL(base, base.getFile());
                return new URL(p.toExternalForm() + src);
            }
            else if (src.startsWith("./"))
            {
                return new URL(getRootPath(base) + src.substring(2));
            }
            else if (src.startsWith("../"))
            {
                URL path = new URL(getAbsolutePath(base));
                return new URL(path, src);
            }
            else
            {
                if (src.indexOf("://") > 0)
                {
                    // looks like an absolute
                    return new URL(src);
                }
            }
        }
        return new URL(getAbsolutePath(base) + src);
    }

    public static String getRootDomain(String url) throws MalformedURLException
    {
        return getRootDomain(new URL(url));
    }

    /**
     * return the root domain, without any subdomains
     *
     * @param url url
     * @return root domain
     */
    public static String getRootDomain(URL url)
    {
        String hostname = url.getHost();
        String tokens[] = hostname.split("\\.");
        if (tokens.length >= 2)
        {
            String partialHost = tokens[tokens.length - 2] + "." + tokens[tokens.length - 1];
            if (isTwoLevelTLD(partialHost))
            {
                return tokens[tokens.length - 3] + "." + partialHost;
            }
            return partialHost;
        }
        return hostname;
    }

    public static String getRootPath(String url) throws MalformedURLException
    {
        return getRootPath(new URL(url));
    }

    public static String getAbsolutePath(String url) throws MalformedURLException
    {
        return getAbsolutePath(new URL(url));
    }

    /**
     * return the absolute path of the document folder
     *
     * @param url url
     * @return absolute path
     */
    public static String getAbsolutePath(URL url)
    {
        String path = url.getPath();
        if (path.endsWith("/"))
        {
            return getRootPath(url) + path.substring(1);
        }
        else
        {
            int idx = path.lastIndexOf('/');
            if (idx > 0)
            {
                return getRootPath(url) + path.substring(1, idx + 1);
            }
            return getRootPath(url);
        }
    }

    /**
     * return the root URL without any path
     *
     * @param url url
     * @return root path
     */
    public static String getRootPath(URL url)
    {
        String proto = url.getProtocol();
        int port = url.getPort();
        return proto + "://" + url.getHost() + (port > 0 ? ":" + port : "") + "/";
    }

    public static URL getRootUrl(URL url) throws MalformedURLException
    {
        return new URL(url.getProtocol(), url.getHost(), url.getPort(), "/");
    }

    public static URL getRootUrl(String url) throws MalformedURLException
    {
        return getRootUrl(new URL(url));
    }

    public static boolean isUrl(String input)
    {
        String urlString;
        if (input.startsWith("http://"))
        {
            urlString = input;
        }
        else
        {
            urlString = "http://" + input;
        }

        try
        {
            URL url = new URL(urlString);
            if (!url.getProtocol().startsWith("http"))
            {
                return false;
            }
            String host = url.getHost();
            String[] hostParts = host.split("\\.");
            return 1 != hostParts.length && TLDS.contains(hostParts[hostParts.length - 1]);
        }
        catch (MalformedURLException malformedUrlException)
        {
            return false;
        }
    }

    public static String buildDefaultNormalizedFavIconFromUrl(String url)
    {
        try
        {
            return buildDefaultNormalizedFavIconFromUrl(new URL(url));
        }
        catch (MalformedURLException malformedUrlException)
        {
            return null;
        }
    }

    public static String buildDefaultNormalizedFavIconFromUrl(URL url)
    {
        if (null == url)
        {
            return null;
        }

        StringBuilder result = new StringBuilder(url.getProtocol());
        result.append(":");
        if (url.getAuthority() != null && url.getAuthority().length() > 0)
        {
            result.append("//");
            result.append(url.getAuthority());
        }
        result.append("/favicon.ico");

        return normalize(result.toString());
    }

    public static String normalize(String url)
    {
        if (null == url)
        {
            return null;
        }

        if (!url.startsWith("http://"))
        {
            return normalize("http://" + url);
        }

        URL u;
        try
        {
            u = new URL(url);
        }
        catch (MalformedURLException e)
        {
            return null;
        }

        // pre-compute length of StringBuffer
        int len = u.getProtocol().length() + 1;
        if (u.getAuthority() != null && u.getAuthority().length() > 0)
        {
            len += 2 + u.getAuthority().length();
        }
        if (u.getPath() != null)
        {
            len += u.getPath().length();
        }
        ++len; // for the path slash
        if (u.getQuery() != null)
        {
            len += 1 + u.getQuery().length();
        }
        if (u.getRef() != null)
        {
            len += 1 + u.getRef().length();
        }

        StringBuilder result = new StringBuilder(len);
        result.append(u.getProtocol());
        result.append(":");
        if (u.getAuthority() != null && u.getAuthority().length() > 0)
        {
            result.append("//");
            result.append(u.getAuthority());
        }
        String path = u.getPath();
        if (path != null)
        {
            if (path.endsWith("/"))
            {
                path = path.substring(0, path.length() - 1);
            }
            result.append(path);
        }
        if (u.getQuery() != null)
        {
            result.append('?');
            result.append(u.getQuery());
        }
        if (u.getRef() != null)
        {
            result.append("#");
            result.append(u.getRef());
        }
        return result.toString();
    }

    /**
     * return the base domain name for the URL. For example, the base domain name for
     * <code>images.google.com</code> will be <code>google.com</com> and <code>www.google.com</code>
     * will be <code>google.com</code> and <code>google.com</code> will be <code>google.com</code>
     *
     * @param url url
     * @return base domain name
     */
    public static String getBaseDomainName(URL url)
    {
        String hostname = url.getHost();
        String subdomains[] = hostname.split("\\.");
        String domain = subdomains[subdomains.length - 2] + "." + subdomains[subdomains.length - 1];
        if (URLUtil.isTwoLevelTLD(domain))
        {
            if (subdomains.length < 4)
            {
                throw new IllegalArgumentException("invalid URL: " + url + ", domain is a two-level domain and no host was provided");
            }
            domain = subdomains[subdomains.length - 3] + "." + domain;
        }
        return domain;
    }

    /**
     * given a URL return a set of names of all the possible subdomains. For example, given:
     * <code>www.images.google.com</code> you should get back:
     * <ul>
     * <li>www.images.google.com</li>
     * <li>images.google.com</li>
     * <li>google.com</li>
     * </ul>
     *
     * @param url url to get subdomains for
     * @return set of subdomains
     */
    public static Set<String> getSubdomains(URL url)
    {
        String hostname = url.getHost();
        String subdomains[] = hostname.split("\\.");
        // get the root domain
        int subdomainPointer = 3;
        String domain = subdomains[subdomains.length - 2] + "." + subdomains[subdomains.length - 1];
        if (URLUtil.isTwoLevelTLD(domain))
        {
            if (subdomains.length < 4)
            {
                throw new IllegalArgumentException("invalid URL: " + url + ", domain is a two-level domain and no host was provided");
            }
            domain = subdomains[subdomains.length - 3] + "." + domain;
            subdomainPointer = 4;
        }
        Set<String> subdomainList = new HashSet<String>();
        subdomainList.add(hostname);

        // more subdomains, now create them too
        String subdomain = "";
        while (subdomain != null && !(subdomain + domain).equals(hostname))
        {
            try
            {

                subdomainList.add(subdomain + domain);
            }
            catch (Exception ex)
            {
                // don't fail
            }
            if (subdomains.length > subdomainPointer && subdomainPointer >= 0)
            {
                subdomain = subdomains[subdomains.length - subdomainPointer] + ".";
                subdomainPointer++;
            }
            else
            {
                break;
            }
        }
        return subdomainList;
    }

    public static void main(String[] args) throws Exception
    {
        String url;

        url = "apple";
        System.out.println(url + ": " + isUrl(url));

        url = "apple.com";
        System.out.println(url + ": " + isUrl(url));

        url = "www.apple";
        System.out.println(url + ": " + isUrl(url));

        url = "www.apple.com";
        System.out.println(url + ": " + isUrl(url));

        url = "bbc.co.u";
        System.out.println(url + ": " + isUrl(url));

        url = "bbc.co.uk";
        System.out.println(url + ": " + isUrl(url));

        url = "http://microsoft";
        System.out.println(url + ": " + isUrl(url));

        url = "http://microsoft.com";
        System.out.println(url + ": " + isUrl(url));

        url = "http://microsoft.com";
        System.out.println(url + ": " + getRootDomain(url));

        url = "http://microsoft.co.uk";
        System.out.println(url + ": " + getRootDomain(url));

        System.out.println("subdomains = " + getSubdomains(new URL("http://blog.jeffhaynie.us")));
        System.out.println("subdomains = " + getSubdomains(new URL("http://www.blog.jeffhaynie.co.dk")));
        System.out.println("subdomains = " + getBaseDomainName(new URL("http://www.blog.jeffhaynie.co.dk")));
        System.out.println("subdomains = " + getBaseDomainName(new URL("http://blog.jeffhaynie.us")));
    }
}

<?xml version='1.0' encoding='utf-8' ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:param name="mergefile"/>
	<xsl:template match="*|@*|comment()|processing-instruction()|text()">
		<xsl:copy>
			<xsl:apply-templates select="*|@*|comment()|processing-instruction()|text()"/>
			<!--<xsl:apply-templates select="document('appcelerator-services.xml')/bea"/>-->
		</xsl:copy>
		<!--<xsl:copy-of select="document('appcelerator-services.xml')//bean"/>-->
	</xsl:template>
	<xsl:template match="//beans">
		<xsl:element name="beans">
	        <!--<xsl:copy-of select="//bean"/>-->
			<xsl:copy-of select="document($mergefile)//bean"/>
		</xsl:element>
	</xsl:template>
</xsl:stylesheet>

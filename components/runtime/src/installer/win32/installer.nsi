;-------------------------------------------------------------------;
;
; Appcelerator RIA Platform Win32 Installer
;
;-------------------------------------------------------------------;
;
; This file is part of Appcelerator.
;
; Copyright (C) 2006-2008 by Appcelerator, Inc. All Rights Reserved.
; For more information, please visit http://www.appcelerator.org
;
; Appcelerator is free software: you can redistribute it and/or modify
; it under the terms of the GNU General Public License as published by
; the Free Software Foundation, either version 3 of the License, or
; (at your option) any later version.
; 
; This program is distributed in the hope that it will be useful,
; but WITHOUT ANY WARRANTY; without even the implied warranty of
; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
; GNU General Public License for more details.
; 
; You should have received a copy of the GNU General Public License
; along with this program.  If not, see <http://www.gnu.org/licenses/>.
;

!include "AddToPath.nsh"
!include "MUI.nsh"

Name "Appcelerator RIA Platform"
OutFile "installer.exe"

CRCCheck on
XPStyle on
ShowInstDetails show

!define VERSION "2.1.0"

VIProductVersion 2.1.0.0
VIAddVersionKey ProductName "Appcelerator RIA Platform"
VIAddVersionKey ProductVersion "${VERSION}"
VIAddVersionKey CompanyName "Appcelerator, Inc."
VIAddVersionKey CompanyWebsite "http://www.appcelerator.org"
VIAddVersionKey FileVersion ""
VIAddVersionKey FileDescription ""
VIAddVersionKey LegalCopyright ""

!define RUBY_REGKEY "Software\RubyInstaller"
!define REGKEY "Software\Appcelerator RIA Platform"
InstallDirRegKey HKLM "${REGKEY}" "DefaultPath"
InstallDir "$PROGRAMFILES\Appcelerator"

BrandingText "Nullsoft Installer"

Icon "icon.ico"
LicenseForceSelection radiobuttons
RequestExecutionLevel admin
    
var RandomSeed

!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "header.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "sidebar.bmp"
!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"


!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH
  
!insertmacro MUI_LANGUAGE "English"


Section

  SectionIn RO
  SetOutPath "$INSTDIR"
  
  File "LICENSE"
  File "appcelerator"
  File *.rb
  File *.txt
  File *.exe
  File *.dll
  File *.zip
  File /r "commands"
  File /r "lib"

  ; check to see if we have ruby installed
  nsExec::ExecToStack '"ruby" --version'
  Pop $0
  Pop $1
  ;MessageBox MB_OK "$0, $1"

  ; if command ran find, will exit with 0
  StrCmp $0 "0" checkver install

  ; now check the version of ruby
  checkver:
  DetailPrint "Ruby looks to already be installed: $1"
  DetailPrint "Checking for correct version"
  StrCpy $R2 "$1" 5 5
  StrCpy $R3 "$R2" 1 0
  StrCpy $R4 "$R2" 1 2
  StrCpy $R5 "$R2" 1 4

  ;MessageBox MB_OK "major[$R3] [$R4] [$R5]"

  ; needs to be >= 1.8.6
  IntCmp $R3 1 checkminor noinstall install

  checkminor:
  IntCmp $R4 8 checkbuild noinstall install
  
  checkbuild:
  IntCmp $R5 6 noinstall noinstall
  
  install:
  ; download from the internet

  ; these are our different mirrors we will randomly select from
  Push "http://rubyforge.rubyuser.de/rubyinstaller/ruby186-26.exe"
  Push "http://files.rubyforge.mmmultiworks.com/rubyinstaller/ruby186-26.exe"
  Push "http://rubyforge-files.ruby-forum.com/rubyinstaller/ruby186-26.exe"
  Push "http://files.rubyforge.vm.bytemark.co.uk/rubyinstaller/ruby186-26.exe"
  Push "http://rubyforge.iasi.roedu.net/files/rubyinstaller/ruby186-26.exe"
  Push 5
  Push "$INSTDIR/ruby-installer.exe"
  Call DownloadFromRandomMirror
  Pop $0
  StrCmp $0 "cancel" 0 +3
  MessageBox MB_OK "Download canceled"
  Goto DownloadFailed
  StrCmp $0 "success" 0 +2
  Goto DownloadComplete
  MessageBox MB_OK "Error $0"

#  NSISdl::download /TRANSLATE2 "Downloading Ruby installer... One moment" "Connecting ..." " (1 second remaining)" " (1 minute remaining)" " (1 hour remaining)" " (%u seconds remaining)" " (%u minutes remaining)" " (%u hours remaining)" "%skB (%d%%) of %skB @ %u.%01ukB/s" "http://rubyforge.org/frs/download.php/29263/ruby186-26.exe" "$INSTDIR/ruby-installer.exe"
#  Pop $R0 ;Get the return value
#  StrCmp $R0 "success" +3
# MessageBox MB_OK "Download failed attempting to get the Windows Ruby Installer.  Please try again."
#  Quit

  DownloadFailed:
  Quit
  
  DownloadComplete:

  ; if you want to embed it instead
  ; File "ruby-installer.exe"

  DetailPrint "The ruby install will take a few moments, please wait..."
  SetDetailsView show
  ExecWait '"$INSTDIR\ruby-installer.exe" /S' $0

  DetailPrint "The ruby install completed successfully"
  goto complete

  noinstall:
  DetailPrint "Ruby is already installed, will continue with remaining install"

  complete:

  ; Add Appcelerator directory to the path
  Push $INSTDIR
  Call AddToPath
  
  ReadRegStr $R0 HKLM "${RUBY_REGKEY}" "DefaultPath"
  
  DetailPrint "Executing postflight installer script"
  ExecWait '"$R0\bin\rubyw.exe" "$INSTDIR\post-flight.rb" "$R0\bin\ruby.exe" "$INSTDIR"'
 
  ;Store installation folder
  WriteRegStr HKCU "Software\Appcelerator" "" $INSTDIR

  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "DisplayName" "Appcelerator RIA Platform"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "Publisher" "Appcelerator, Inc."
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "URLInfoAbout" "http://www.appcelerator.org"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "URLUpdateInfo" "http://www.appcelerator.org"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "HelpLink" "mailto:support@appcelerator.com"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform" "UninstallString" "$INSTDIR\Uninstall.exe"
  
  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ;run installation
  DetailPrint "Installing Appcelerator Appcenter (admin console) ... this will take several seconds"
  nsExec::Exec '"$INSTDIR\app.bat"'


SectionEnd

Function .onInstSuccess

  ; open our welcome page
  StrCpy $0 "http://127.0.0.1:9080"
  Call openLinkNewWindow

FunctionEnd

Section "Uninstall"

  nsExec::Exec "net stop appcelerator"

  Delete "$INSTDIR\ruby-installer.exe"
  Delete "$INSTDIR\Uninstall.exe"
  Delete "$INSTDIR\post-flight.rb"
  Delete "$INSTDIR\LICENSE"
  Delete "$INSTDIR\appcelerator"
  Delete "$INSTDIR\app.bat"

  RMDir /r "$INSTDIR\commands"
  RMDir /r "$INSTDIR\lib"
  RMDir /r "$INSTDIR"

  Push $INSTDIR
  Call un.RemoveFromPath

  DeleteRegKey /ifempty HKCU "Software\Appcelerator RIA Platform"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Appcelerator RIA Platform"

SectionEnd


Function openLinkNewWindow
  Push $3 
  Push $2
  Push $1
  Push $0
  ReadRegStr $0 HKCR "http\shell\open\command" ""
  StrCpy $2 '"'
  StrCpy $1 $0 1
  StrCmp $1 $2 +2 # if path is not enclosed in " look for space as final char
  StrCpy $2 ' '
  StrCpy $3 1
  loop:
    StrCpy $1 $0 1 $3
    DetailPrint $1
    StrCmp $1 $2 found
    StrCmp $1 "" found
    IntOp $3 $3 + 1
    Goto loop
 
  found:
    StrCpy $1 $0 $3
    StrCmp $2 " " +2
    StrCpy $1 '$1"'
 
  Pop $0
  Exec '$1 $0'
  Pop $1
  Pop $2
  Pop $3
FunctionEnd

 
###################################################
# 
# Downloads a file from a list of mirrors
# (the fist mirror is selected at random)
#
# Usage:
# 	Push Mirror1
# 	Push [Mirror2]
# 	...
# 	Push [Mirror10]
#	Push NumMirrors		# 10 Max
#	Push FileName
#	Call DownloadFromRandomMirror
#	Pop Return
#
#	Returns the NSISdl result
Function DownloadFromRandomMirror
	Exch $R1 #File name
	Exch
	Exch $R0 #Number of Mirros
	Push $0
	Exch 3
	Pop $0	#Mirror 1
	IntCmpU "2" $R0 0 0 +4
		Push $1
		Exch 4
		Pop $1	#Mirror 2
	IntCmpU "3" $R0 0 0 +4
		Push $2
		Exch 5
		Pop $2	#Mirror 3
	IntCmpU "4" $R0 0 0 +4
		Push $3
		Exch 6
		Pop $3	#Mirror 4
	IntCmpU "5" $R0 0 0 +4
		Push $4
		Exch 7
		Pop $4	#Mirror 5
	IntCmpU "6" $R0 0 0 +4
		Push $5
		Exch 8
		Pop $5	#Mirror 6
	IntCmpU "7" $R0 0 0 +4
		Push $6
		Exch 9
		Pop $6	#Mirror 7
	IntCmpU "8" $R0 0 0 +4
		Push $7
		Exch 10
		Pop $7	#Mirror 8
	IntCmpU "9" $R0 0 0 +4
		Push $8
		Exch 11
		Pop $8	#Mirror 9
	IntCmpU "10" $R0 0 0 +4
		Push $9
		Exch 12
		Pop $9	#Mirror 10
	Push $R4
	Push $R2
	Push $R3
	Push $R5
	Push $R6
	
	# If you don't want a random mirror, replace this block with:
	# StrCpy $R3 "0"
	# -----------------------------------------------------------
	StrCmp $RandomSeed "" 0 +2
		StrCpy $RandomSeed $HWNDPARENT  #init RandomSeed
	
	Push $RandomSeed
	Push $R0
	Call LimitedRandomNumber
	Pop $R3
	Pop $RandomSeed
	# -----------------------------------------------------------
	
	StrCpy $R5 "0"
MirrorsStart:
	IntOp $R5 $R5 + "1"
	StrCmp $R3 "0" 0 +3
		StrCpy $R2 $0
		Goto MirrorsEnd
	StrCmp $R3 "1" 0 +3
		StrCpy $R2 $1
		Goto MirrorsEnd
	StrCmp $R3 "2" 0 +3
		StrCpy $R2 $2
		Goto MirrorsEnd
	StrCmp $R3 "3" 0 +3
		StrCpy $R2 $3
		Goto MirrorsEnd
	StrCmp $R3 "4" 0 +3
		StrCpy $R2 $4
		Goto MirrorsEnd
	StrCmp $R3 "5" 0 +3
		StrCpy $R2 $5
		Goto MirrorsEnd
	StrCmp $R3 "6" 0 +3
		StrCpy $R2 $6
		Goto MirrorsEnd
	StrCmp $R3 "7" 0 +3
		StrCpy $R2 $7
		Goto MirrorsEnd
	StrCmp $R3 "8" 0 +3
		StrCpy $R2 $8
		Goto MirrorsEnd
	StrCmp $R3 "9" 0 +3
		StrCpy $R2 $9
		Goto MirrorsEnd
	StrCmp $R3 "10" 0 +3
		StrCpy $R2 $10
		Goto MirrorsEnd
 
MirrorsEnd:
	IntOp $R6 $R3 + "1"
	DetailPrint "Downloading from mirror $R6: $R2"
	
	NSISdl::download "$R2" "$R1"
	Pop $R4
	StrCmp $R4 "success" Success
	StrCmp $R4 "cancel" DownloadCanceled
	IntCmp $R5 $R0 NoSuccess
	DetailPrint "Download failed (error $R4), trying with other mirror"
	IntOp $R3 $R3 + "1"
	IntCmp $R3 $R0 0 MirrorsStart
	StrCpy $R3 "0"
	Goto MirrorsStart
 
DownloadCanceled:
	DetailPrint "Download Canceled: $R2"
	Goto End
NoSuccess:		
	DetailPrint "Download Failed: $R1"
	Goto End
Success:
	DetailPrint "Download completed."
End:
	Pop $R6
	Pop $R5
	Pop $R3
	Pop $R2
	Push $R4
	Exch
	Pop $R4
	Exch 2
	Pop $R1
	Exch 2
	Pop $0
	Exch
	
	IntCmpU "2" $R0 0 0 +4
		Exch 2	
		Pop $1
		Exch
	IntCmpU "3" $R0 0 0 +4
		Exch 2	
		Pop $2
		Exch
	IntCmpU "4" $R0 0 0 +4
		Exch 2	
		Pop $3
		Exch
	IntCmpU "5" $R0 0 0 +4
		Exch 2	
		Pop $4
		Exch
	IntCmpU "6" $R0 0 0 +4
		Exch 2	
		Pop $5
		Exch
	IntCmpU "7" $R0 0 0 +4
		Exch 2	
		Pop $6
		Exch
	IntCmpU "8" $R0 0 0 +4
		Exch 2	
		Pop $7
		Exch
	IntCmpU "9" $R0 0 0 +4
		Exch 2	
		Pop $8
		Exch
	IntCmpU "10" $R0 0 0 +4
		Exch 2	
		Pop $9
		Exch
	Pop $R0
FunctionEnd
 
###############################################################
#
# NOTE: If you don't want a random mirror, remove this Function
#
# Returns a random number
#
# Usage:
# 	Push Seed (or previously generated number)
#	Call RandomNumber
#	Pop Generated Random Number
Function RandomNumber
	Exch $R0
	
	IntOp $R0 $R0 * "13"
	IntOp $R0 $R0 + "3"
	IntOp $R0 $R0 % "1048576" # Values goes from 0 to 1048576 (2^20)
 
	Exch $R0
FunctionEnd
 
####################################################
#
# NOTE: If you don't want a random mirror, remove this Function
#
# Returns a random number between 0 and Max-1
#
# Usage:
# 	Push Seed (or previously generated number)
#	Push MaxValue
#	Call RandomNumber
#	Pop Generated Random Number
#	Pop NewSeed
Function LimitedRandomNumber
	Exch $R0
	Exch
	Exch $R1
	Push $R2
	Push $R3
 
	StrLen $R2 $R0
	Push $R1
RandLoop:
	Call RandomNumber
	Pop $R1	#Random Number
	IntCmp $R1 $R0 0 NewRnd
	StrLen $R3 $R1	
	IntOp $R3 $R3 - $R2
	IntOp $R3 $R3 / "2"
	StrCpy $R3 $R1 $R2 $R3
	IntCmp $R3 $R0 0 RndEnd
NewRnd:
	Push $R1
	Goto RandLoop
RndEnd:
	StrCpy $R0 $R3
	IntOp $R0 $R0 + "0" #removes initial 0's
	Pop $R3
	Pop $R2
	Exch $R1
	Exch
	Exch $R0
FunctionEnd
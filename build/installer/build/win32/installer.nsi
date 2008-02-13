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


Icon "icon.ico"
LicenseForceSelection radiobuttons
RequestExecutionLevel admin
    


!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\orange.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange.bmp"
!define MUI_ABORTWARNING


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
  
  File "post-flight.rb"
  File "LICENSE"
  File "appcelerator"
  File "console.rb"
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
  NSISdl::download /TRANSLATE2 "Downloading Ruby installer... One moment" "Connecting ..." " (1 second remaining)" " (1 minute remaining)" " (1 hour remaining)" " (%u seconds remaining)" " (%u minutes remaining)" " (%u hours remaining)" "%skB (%d%%) of %skB @ %u.%01ukB/s" "http://rubyforge.org/frs/download.php/29263/ruby186-26.exe" "$INSTDIR/ruby-installer.exe"
  Pop $R0 ;Get the return value
  StrCmp $R0 "success" +3
  MessageBox MB_OK "Download failed attempting to get the Windows Ruby Installer.  Please try again."
  Quit


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

SectionEnd

Function .onInstSuccess

  ; open our welcome page
  StrCpy $0 "http://www.appcelerator.org"
  Call openLinkNewWindow

FunctionEnd

Section "Uninstall"

  Delete "$INSTDIR\ruby-installer.exe"
  Delete "$INSTDIR\Uninstall.exe"
  Delete "$INSTDIR\post-flight.rb"
  Delete "$INSTDIR\LICENSE"
  Delete "$INSTDIR\appcelerator"
  Delete "$INSTDIR\appcelerator.bat"

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

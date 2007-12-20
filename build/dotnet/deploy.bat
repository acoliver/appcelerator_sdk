set IIS_APPROOT=C:\Inetpub\wwwroot
set ISAPI_DLL="C:\WINDOWS\Microsoft.NET\Framework\v2.0.50727\Aspnet_isapi.dll"
set PROJECT=sb


mkdir %IIS_APPROOT%\%PROJECT%\bin\deploy
cd bin\Release
copy TestService.dll %IIS_APPROOT%\%PROJECT%\bin\deploy /Y
copy Appcelerator.dll %IIS_APPROOT%\%PROJECT%\bin /Y
cd ..\..
xcopy *-config.xml %IIS_APPROOT%\%PROJECT%\bin /Y

cd src\web
xcopy * %IIS_APPROOT%\%PROJECT% /S
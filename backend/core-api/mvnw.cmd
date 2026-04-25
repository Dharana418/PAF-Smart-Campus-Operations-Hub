@echo off
setlocal enabledelayedexpansion
set MAVEN_PROJECTBASEDIR=%CD%
set MAVEN_HOME=%CD%\.mvn\wrapper\maven-wrapper.jar
java -jar "%MAVEN_HOME%" %*

@echo off

:: UTF-8
chcp 65001

@echo off

rem 设置文件根目录，后面不带换行，好像会不支持中文，沙雕东西

:: set "dirs=F:\相关文件夹"

rem set /p dirs=请输入目录路径：
set /p dirs=请输入所有目录路径（用空格分隔）：

:: set "print=C:\Users\admin\Desktop\文件目录.txt"

:: 获取日期和时间
set "date=%DATE%"
set "time=%TIME%"
set "print=文件目录-%date:~3,4%-%date:~8,2%-%date:~11,2% %time:~0,2%-%time:~3,2%-%time:~6,2%.txt"

:: /a
:: 执行运算结果，并将结果赋值给变量
rem set /a "randomNumber=%RANDOM% * %RANDOM%"
rem set "print=文件目录-%randomNumber%.txt"

rem echo Directory listing for: %dirs%
rem dir "%dirs%"

:: /s
:: 指示 dir 命令递归地列出所有子目录。
:: /b
:: 以裸格式（仅文件名）列出文件。
:: /a-d
:: 不列出目录。但好像没什么卵用
:: /a-h
:: 不列出隐藏文件。

:: echo "%dirs%"
:: echo "%print%"

rem dir "%dirs%" /s /b /a-d /a-h > "%print%"

for %%i in (%dirs%) do (
    if exist "%%~i" (
        echo 目录: %%~i
        dir "%%~i" /s /b /a-d /a-h >> "%print%"
    ) else (
        echo 目录 %%~i 不存在，已跳过。 
    )
)

pause
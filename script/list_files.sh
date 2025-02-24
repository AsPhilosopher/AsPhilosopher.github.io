#!/bin/bash

# 检查是否提供了目录参数
if [ $# -eq 0 ]; then
    echo "使用方法: $0 <目录路径1> [目录路径2 ...]"
    exit 1
fi

# 创建输出文件名（在当前目录下）
output_file="file_list.txt"

# 清空或创建输出文件
> "$output_file"

# 处理每个输入的目录
for directory in "$@"; do
    # 检查提供的路径是否存在且是一个目录
    if [ ! -d "$directory" ]; then
        echo "警告: '$directory' 不是一个有效的目录，已跳过"
        continue
    fi

    # 获取目录的绝对路径
    abs_directory=$(cd "$directory" && pwd)
    
    echo "正在处理目录: $abs_directory"
    
    # 使用 find 命令列出所有文件（不包括目录）并追加到文件中
    find "$abs_directory" -type f >> "$output_file"
done

# 对文件进行排序并去重
sort -u "$output_file" -o "$output_file"

echo "文件列表已保存到 $output_file"
echo "共处理了 $(wc -l < "$output_file") 个文件" 
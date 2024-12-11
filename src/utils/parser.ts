/**
 * 解析 .list 文件规则
 * @param listContent .list 文件的内容
 * @returns 解析后的规则数组
 */
export function listParser(listContent: string): string[] {
    const lines = listContent.split("\n");
    const rules: string[] = [];

    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("#")) {
            rules.push(trimmedLine);
        }
    });

    return rules;
}

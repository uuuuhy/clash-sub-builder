/**
 * 将 .list 规则列表中的单条规则转换为 clash 规则
 * @param rule 单条规则
 * @param group 规则分组
 * @returns 格式化后的规则字符串
 */
export function listRuleFormatter(rule: string, group: string): string {
    let formattedRule: string = `${rule},${group}`.replace("[]", "");

    // 是否是 USER-AGENT / URL-REGEX 规则, clash 暂不支持该类规则
    if (rule.startsWith("USER-AGENT") || rule.startsWith("URL-REGEX")) {
        return ""; // 返回空字符串
    }

    // 是否是 no-resolve 规则
    if (formattedRule.includes(",no-resolve")) {
        const pure = formattedRule.replace(",no-resolve", "");
        formattedRule = `${pure},no-resolve`;
    }

    // 替换 FINAL 为 MATCH
    if (formattedRule.startsWith("FINAL")) {
        formattedRule = formattedRule.replace("FINAL", "MATCH");
    }

    return formattedRule;
}

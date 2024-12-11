interface ProxyGroupItem {
    name: string;
    type: string;
    url?: string;
    interval?: number;
    rule: string[];
}

/**
 * rulesets.toml 中的 Ruleset 配置
 */
interface RulesetsItem {
    group: string;
    ruleset: string;
}

interface Template {
    name: string;
    yaml: any; // 根据实际返回的类型，可以更精确地声明
}

/**
 * Clash 配置文件的 proxy-group 字段的配置
 */
interface ClashProxyGroupItem {
    name: string;
    type: string;
    url?: string;
    interval?: number;
    proxies: string[];
}

/**
 * Clash 配置文件的 proxies 字段的配置
 */
interface ClashProxiesItem {
    name: string;
}

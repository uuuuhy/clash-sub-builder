import { setEnv } from "@cross/env";
import { parseArgs } from "@std/cli";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "yaml";
import { ROOT_PATH } from "./constance.ts";
import {
    getClashTemplates,
    getGroups,
    getRulesets,
} from "./utils/configGetter.ts";
import { uploadFileToGist } from "./utils/gist.ts";
import {
    generateProxies,
    generateProxyGroups,
    generateRules,
} from "./utils/index.ts";
import { log } from "./utils/log.ts";
import { downloadACL4SSR } from "./utils/rulesDownloader.ts";

async function main(): Promise<void> {
    // 确保 downloadACL4SSR 是异步执行
    downloadACL4SSR();
    const groups = getGroups();
    const rulesets = getRulesets();
    const templates: Template[] = await getClashTemplates();
    const subUrls: string[] = [];

    for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const fileName = template.name;
        const parsedYaml = template.yaml as {
            proxies: ClashProxiesItem[];
            "proxy-groups": ClashProxyGroupItem[];
            rules: string[];
        };

        log(
            "info",
            `=============== ${fileName} process start ===============`
        );

        // 处理 proxies 配置
        parsedYaml["proxies"] = generateProxies(parsedYaml?.proxies || []);

        // 处理 proxy-groups 配置
        const proxyGroups = generateProxyGroups(parsedYaml.proxies, groups);
        parsedYaml["proxy-groups"] = proxyGroups;

        // 处理 rules 配置
        const rules = generateRules(rulesets, groups);
        parsedYaml["rules"] = rules;

        // 写入文件
        const templateSuffix = fileName
            .replace(path.extname(fileName), "")
            .replace("template", "");
        const writeFileName = `subscribe${templateSuffix}.yml`;

        fs.writeFileSync(
            path.join(ROOT_PATH, writeFileName),
            yaml.stringify(parsedYaml),
            "utf-8"
        );
        log("success", "🎊 subscribe.yml 生成成功!");

        // 上传到 Gist
        if (process.env.NODE_ENV === "production") {
            try {
                const gistUrl = await uploadFileToGist(
                    writeFileName,
                    fs.readFileSync(
                        path.join(ROOT_PATH, writeFileName),
                        "utf-8"
                    )
                );
                subUrls.push(gistUrl);
                log("success", `🎊 Gist 上传成功`);
            } catch (error) {
                log("debug", `${error}`);
                log("error", "Gist 上传失败!");
            }
        }

        log("info", `=============== ${fileName} process end ===============`);
    }

    // 任务结束
    log("info", "🎉 任务结束");
    subUrls.forEach((url) => {
        log("success", `已生成的订阅地址: ${url}`);
    });
}

if (import.meta.main) {
    const parsedArgs = parseArgs(Deno.args) as {
        env: string;
    };

    // 设置环境变量
    if (parsedArgs.env === "development") {
        setEnv("NODE_ENV", "development");
    }

    // 启动 main 函数
    main().catch((error) => log("error", error));
}

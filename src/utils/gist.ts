import { Octokit } from "@octokit/rest";
import { getGistConfig } from "./configGetter.ts";
import { log } from "./log.ts";

const gistConfig = getGistConfig();
const token: string = gistConfig.token;
const gistId: string = gistConfig.id;

/**
 * 上传文件到 gist 项目中
 * @param fileName 文件名
 * @param fileContent 文件内容
 * @returns Gist 文件的原始 URL
 */
export async function uploadFileToGist(
    fileName: string,
    fileContent: string
): Promise<string> {
    if (!token || !gistId) {
        throw new Error("请按照 README 配置 Github Token 和 Gist ID");
    }
    const octokit = new Octokit({ auth: token });

    // 上传文件
    const res = await octokit.rest.gists.update({
        gist_id: gistId,
        description:
            "clash subscribe (created by node EsunR/clash-sub-builder)",
        files: {
            [fileName]: {
                content: fileContent,
            },
        },
    });

    // 拼接 URL
    const gistUrl = `${
        res?.data?.files?.[fileName]?.raw_url?.split("/raw")[0]
    }/raw/${fileName}`;
    return gistUrl;
}

/**
 * 从 gist 获取模板
 * @returns Gist 中的模板内容或 null
 */
export async function getTemplateFromGist(): Promise<string | null> {
    if (!gistId || !token) {
        log("info", "未配置 Gist 信息，使用本地模板");
        return null;
    }
    try {
        const octokit = new Octokit({ auth: token });

        // 下载模板
        const res = await octokit.rest.gists.get({
            gist_id: gistId,
        });
        const files = res.data.files;

        if (files && files["template.yml"]) {
            const template = files["template.yml"].content || "";
            log("info", "检测到 Gist 中存在模板，优先使用选择使用");
            return template;
        } else {
            log("info", "未检测到 Gist 中存在模板，使用本地模板");
            return null;
        }
    } catch (e: any) {
        log("debug", e);
        throw new Error("Gist 模板下载失败，请检查对应 Gist ID 是否正确");
    }
}

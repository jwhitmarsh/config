import * as path from "https://deno.land/x/std@0.51.0/path/mod.ts"
import * as fs from "https://deno.land/x/std@0.51.0/fs/mod.ts";
import * as yaml from "https://deno.land/x/std@0.51.0/encoding/yaml.ts";
import * as toml from "https://deno.land/x/std@0.51.0/encoding/toml.ts"

/**
 * user options
 * includeDefault is only relevant to es modules (when loading js/ts files)
 */
interface ILoadOptions {
  readonly searchDir?: string,
  readonly file: string,
  readonly includeDefault?: boolean
}

/**
 * internal representation of config files
 */
export type configFileFormat = "module" | "toml" | "json" | "yaml"
interface IConfigFile {
  readonly type: configFileFormat;
  readonly fileName: string;
}

export class Config {
  private static async actuallyLoad({
    searchDir = Deno.cwd(),
    includeDefault = false
  }: ILoadOptions, configFile: IConfigFile): Promise<object | undefined> {
    const configFilePath = path.join(searchDir, configFile.fileName)

    if (configFile.type === "module") {
      const config = await import(configFilePath);
      if (includeDefault) return config
      return config.default
    } else if (configFile.type === "toml") {
      const content = await Deno.readTextFile(configFilePath)
      return toml.parse(content)
    } else if (configFile.type === "yaml") {
      const content = await Deno.readTextFile(configFilePath)
      return yaml.parse(content) as object
    } else if (configFile.type === "json") {
      return await fs.readJson(configFilePath) as object
    }
  }

  static async load(opts: ILoadOptions): Promise<object | undefined> {
    const configFiles: ReadonlyArray<IConfigFile> = [
      // first check config directory (which never prepends files with a dot)
      { type: 'module', fileName: `.config/${opts.file}.config.ts` },
      { type: 'module', fileName: `.config/${opts.file}.config.js` },
      { type: "toml", fileName: `.config/${opts.file}.toml`},
      { type: 'json', fileName: `.config/${opts.file}.json` },
      { type: 'yaml', fileName: `.config/${opts.file}.yaml` },
      { type: 'yaml', fileName: `.config/${opts.file}.yml` },
      // then check root directory
      { type: 'module', fileName: `${opts.file}.config.ts` },
      { type: 'module', fileName: `${opts.file}.config.js` },
      { type: "toml", fileName: `.${opts.file}.toml`},
      { type: 'json', fileName: `.${opts.file}.json` },
      { type: 'yaml', fileName: `.${opts.file}.yaml` },
      { type: 'yaml', fileName: `.${opts.file}.yml` },
    ];

    searchForConfig: for(const configFile of configFiles) {
      try {
        return await this.actuallyLoad(opts, configFile)
      } catch {}
    }
    // no configuration files found
    return void 0
  }
}

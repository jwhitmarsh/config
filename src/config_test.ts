import { assertEquals } from "https://deno.land/x/std@0.51.0/testing/asserts.ts"
import * as path from "https://deno.land/x/std@0.51.0/path/mod.ts";
import { Config } from "./config.ts"

const { test } = Deno

const _dirname = path.dirname(new URL(import.meta.url).pathname)
const testDir = (fixturesDir: string): string => path.join(_dirname, 'fixtures', fixturesDir)

const moduleFileEndings = [
  "js", "ts", "js-config", "ts-config"
]
for (const moduleFileEnding of moduleFileEndings) {
  test({
    name: `finds dot ${moduleFileEnding} file ending`,
    async fn(): Promise<void> {
      const config = await Config.load({
        searchDir: testDir(moduleFileEnding),
        file: 'file'
      })

      assertEquals(config, {
        name: moduleFileEnding
      })
    }
  })
}

/**
 * same as previous, but ensure .default exists
 * when config key is set
 */
for (const moduleFileEnding of moduleFileEndings) {
  test({
    name: `finds dot ${moduleFileEnding} file ending with includeDefault enabled`,
    async fn(): Promise<void> {
      const config = await Config.load({
        searchDir: testDir(moduleFileEnding),
        file: "file",
        includeDefault: true
      });

      assertEquals(config, {
        default: { name: moduleFileEnding },
      });
    },
  });
}


const dotFiles: string[] = [
  "toml", "yaml", "yml", "json", "toml-config", "yaml-config", "yml-config", "json-config"
]
for (const dotFile of dotFiles) {
  test({
    name: `find dot config for ${dotFile}`,
    async fn(): Promise<void> {
      const config = await Config.load({
        searchDir: testDir(dotFile),
        file: "file"
      })

      assertEquals(config, {
        name: dotFile
      })
    }
  })
}

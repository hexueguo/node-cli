import Feature from "../Feature";
import path from "path";

class VueFeature extends Feature {
  name = "VueFeature";

  protected _init_(): void {
    this.initScript();
    this.initTemplate();
    this.initDependencies();
    this.initDevDependencies();
  }

  initScript() {
    this.addScripts({
      start: "vue-cli-service serve",
      serve: "vue-cli-service serve",
      build: "vue-cli-service build",
      lint: "vue-cli-service lint",
    });
    this.addScript("build:staging", "vue-cli-service build --mode staging");
    this.addScript("build:dev", "vue-cli-service build --mode development");
  }

  initTemplate() {
    this.addFile("main.js", path.join(__dirname, "./template/main.js"), "src");
    this.addFile("App.vue", path.join(__dirname, "./template/App.vue"), "src");
    this.addFile(
      "index.html",
      path.join(__dirname, "./template/index.html"),
      "public"
    );
    this.addFile(
      `index.js`,
      path.join(__dirname, "./template/router.js"),
      "src/router"
    );
    this.addFile(
      "Home.vue",
      path.join(__dirname, "./template/Home.vue"),
      "src/views"
    );
  }

  initDependencies() {
    this.addDependencies({
      "core-js": "^3.6.5",
      vue: "^3.0.0",
      "vue-router": "^4.0.0-0",
      vuex: "^4.0.0-0",
    });
  }

  initDevDependencies() {
    // this.addDevDependency("", "");
    this.addDevDependencies({
      "@vue/cli-plugin-babel": "~4.5.0",
      "@vue/cli-plugin-eslint": "~4.5.0",
      "@vue/cli-service": "~4.5.0",
      "@vue/compiler-sfc": "^3.0.0",
      "@vue/eslint-config-prettier": "^6.0.0",
      "babel-eslint": "^10.1.0",
      eslint: "^6.7.2",
      "eslint-plugin-prettier": "^3.3.1",
      "eslint-plugin-vue": "^7.0.0",
      prettier: "^2.2.1",
    });
  }
}

export default VueFeature;

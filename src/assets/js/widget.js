/**
 * PreventionWeb Widget Module
 * A simplified local version of the PW Widget embed that is more performant
 * and removes bloat functionality that conflicts with CSP records.
 * @module PW_Widget
 * @support kenneth.hawkins@un.org
 */

var _widget_url = "https://publish.preventionweb.net";

/**
 * Constructs the full domain URL based on the environment
 * @param {string} contentDomain - The domain name
 * @returns {string} Complete domain URL with protocol
 */
function getDomainForEnv(contentDomain) {
  return `https://${contentDomain}`;
}

/**
 * Applies a base URL to relative paths in HTML content
 * @param {string} html - The HTML content to process
 * @param {string} baseUrl - The base URL to prepend to relative paths
 * @returns {string} Processed HTML with absolute URLs
 */
function applyBaseUrl(html, baseUrl) {
  const patterns = {
    link: /(?:href=['"])(?!https?:\/\/|\/\/|#)([^'"]+?)/gi,
    img: /(?:src=['"])(?!https?:\/\/|\/\/|data:)([^'"]+?)/gi,
    bgImage:
      /(?:background-image:url\(['"]?)(?!https?:\/\/|\/\/|data:)([^'")]+?)/gi,
  };

  return Object.entries(patterns).reduce((result, [type, regex]) => {
    return result.replace(regex, (match, path) =>
      match.replace(path, `${baseUrl}${path}`)
    );
  }, html);
}

/**
 * Main Widget Controller
 */
var PW_Widget = {
  /**
   * Initializes the widget with configuration options
   * @param {Object} options - Configuration options
   * @param {string} options.contenttype - Type of content to display
   * @param {string} options.langcode - Language code (default: 'en')
   * @param {boolean} options.includemetatags - Whether to include meta tags
   * @param {boolean} options.includecss - Whether to include CSS
   * @param {string} options.pageid - Page identifier
   * @param {string} options.activedomain - Active domain (default: 'www.preventionweb.net')
   */
  initialize(options = {}) {
    const defaults = {
      contenttype: "",
      langcode: "en",
      includemetatags: false,
      includecss: false,
      pageid: "",
      activedomain: "www.preventionweb.net",
      suffixID: ((Math.random() * 0xffffff) << 0).toString(16),
    };

    const config = { ...defaults, ...options };
    const { suffixID } = config;

    let containerDiv = document.querySelector(`.pw-widget-${suffixID}`);
    if (!containerDiv) {
      containerDiv = document.createElement("div");
      document.body.appendChild(containerDiv);
    }

    containerDiv.id = `PW_Widget_Container_${suffixID}`;
    containerDiv.classList.add("pw-widget-container");

    const widgetBodyURL = new URL(`${_widget_url}/widget-body.php`);
    widgetBodyURL.searchParams.set("contenttype", config.contenttype);
    widgetBodyURL.searchParams.set("includecss", config.includecss);

    fetch(widgetBodyURL)
      .then((response) => response.text())
      .then((data) => {
        containerDiv.innerHTML = `
          ${data}
          <div id="PW_Widget_Content_${suffixID}"></div>
        `;
        containerDiv.dataset.options = JSON.stringify(config);
        containerDiv.dataset.suffixID = suffixID;

        document.getElementById(`PW_Widget_Content_${suffixID}`).innerHTML =
          "Loading";
        this.get_data(config);
      });
  },

  /**
   * Fetches and displays content data
   * @param {Object} options - Configuration options
   * @returns {Promise<void>}
   */
  async get_data(options = {}) {
    if (typeof options === "undefined") {
      options = JSON.parse(
        document.querySelector("div[id^=PW_Widget_Container]").dataset.options
      );
    }

    const activeHostname = getDomainForEnv(
      options.activedomain || "www.preventionweb.net"
    );
    const { suffixID } = options;

    const contentElement = document.querySelector(
      `#PW_Widget_Content_${suffixID}`
    );
    contentElement.innerHTML = "Loading...";

    const apiUrl = new URL(
      `${activeHostname}/api/v2/content/${options.contenttype}`
    );
    apiUrl.searchParams.set("id", options.pageid || "");
    apiUrl.searchParams.set("suffixid", suffixID);
    apiUrl.searchParams.set("langcode", options.langcode || "en");

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.results.length === 0) {
        contentElement.innerHTML = " No records found.";
        return;
      }

      contentElement.innerHTML = applyBaseUrl(
        data.results[0].body,
        activeHostname
      );

      if (options.includemetatags) {
        const entityResponse = await fetch(
          `${activeHostname}/api/v2/content/entity?id=${options.pageid}`
        );
        const dataEntity = await entityResponse.json();

        if (dataEntity.results.length > 0) {
          const metatags = dataEntity.results[0].metatag;
          const documentMetas = document.getElementsByTagName("meta");

          metatags.forEach((meta) => {
            if (meta.tag !== "meta" || meta.attributes.name === "title") return;

            const attrType = meta.attributes.name
              ? "name"
              : meta.attributes.property
              ? "property"
              : "";
            if (!attrType) return;

            const exists = Array.from(documentMetas).some(
              (docMeta) =>
                docMeta.getAttribute(attrType) === meta.attributes[attrType]
            );

            if (!exists) {
              const newMeta = document.createElement("meta");
              newMeta.setAttribute(attrType, meta.attributes[attrType]);
              newMeta.content = meta.attributes.content;
              document.head.appendChild(newMeta);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      contentElement.innerHTML = "Error loading content";
    }
  },

  /**
   * Extracts URL parameter value
   * @param {string} name - Parameter name
   * @param {string} url - URL to parse
   * @returns {string|null} Parameter value or null if not found
   */
  urlParam(name, url) {
    const regex = new RegExp(`[?&]${name}=([^&#]*)`);
    const results = regex.exec(url);
    return results ? decodeURIComponent(results[1]) : null;
  },
};

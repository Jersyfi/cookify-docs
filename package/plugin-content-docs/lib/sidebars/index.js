"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSidebars = exports.loadSidebarsFileUnsafe = exports.resolveSidebarPathOption = exports.DisabledSidebars = exports.DefaultSidebars = void 0;
const tslib_1 = require("tslib");
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const logger_1 = tslib_1.__importDefault(require("@docusaurus/logger"));
const utils_1 = require("@docusaurus/utils");
const js_yaml_1 = tslib_1.__importDefault(require("js-yaml"));
const combine_promises_1 = tslib_1.__importDefault(require("combine-promises"));
const import_fresh_1 = tslib_1.__importDefault(require("import-fresh"));
const validation_1 = require("./validation");
const normalization_1 = require("./normalization");
const processor_1 = require("./processor");
const postProcessor_1 = require("./postProcessor");
exports.DefaultSidebars = {
    defaultSidebar: [
        {
            type: 'autogenerated',
            dirName: '.',
        },
    ],
};
exports.DisabledSidebars = {};
// If a path is provided, make it absolute
function resolveSidebarPathOption(siteDir, sidebarPathOption) {
    return sidebarPathOption
        ? path_1.default.resolve(siteDir, sidebarPathOption)
        : sidebarPathOption;
}
exports.resolveSidebarPathOption = resolveSidebarPathOption;
async function readCategoriesMetadata(contentPath) {
    const categoryFiles = await (0, utils_1.Globby)('**/_category_.{json,yml,yaml}', {
        cwd: contentPath,
    });
    const categoryToFile = lodash_1.default.groupBy(categoryFiles, path_1.default.dirname);
    return (0, combine_promises_1.default)(lodash_1.default.mapValues(categoryToFile, async (files, folder) => {
        const filePath = files[0];
        if (files.length > 1) {
            logger_1.default.warn `There are more than one category metadata files for path=${folder}: ${files.join(', ')}. The behavior is undetermined.`;
        }
        const content = await fs_extra_1.default.readFile(path_1.default.join(contentPath, filePath), 'utf-8');
        try {
            return (0, validation_1.validateCategoryMetadataFile)(js_yaml_1.default.load(content));
        }
        catch (err) {
            logger_1.default.error `The docs sidebar category metadata file path=${filePath} looks invalid!`;
            throw err;
        }
    }));
}
async function loadSidebarsFileUnsafe(sidebarFilePath) {
    // false => no sidebars
    if (sidebarFilePath === false) {
        return exports.DisabledSidebars;
    }
    // undefined => defaults to autogenerated sidebars
    if (typeof sidebarFilePath === 'undefined') {
        return exports.DefaultSidebars;
    }
    // Non-existent sidebars file: no sidebars
    // Note: this edge case can happen on versioned docs, not current version
    // We avoid creating empty versioned sidebars file with the CLI
    if (!(await fs_extra_1.default.pathExists(sidebarFilePath))) {
        return exports.DisabledSidebars;
    }
    // We don't want sidebars to be cached because of hot reloading.
    return (0, import_fresh_1.default)(sidebarFilePath);
}
exports.loadSidebarsFileUnsafe = loadSidebarsFileUnsafe;
async function loadSidebars(sidebarFilePath, options) {
    try {
        const sidebarsConfig = await loadSidebarsFileUnsafe(sidebarFilePath);
        const normalizedSidebars = (0, normalization_1.normalizeSidebars)(sidebarsConfig);
        (0, validation_1.validateSidebars)(normalizedSidebars);
        const categoriesMetadata = await readCategoriesMetadata(options.version.contentPath);
        const processedSidebars = await (0, processor_1.processSidebars)(normalizedSidebars, categoriesMetadata, options);
        return (0, postProcessor_1.postProcessSidebars)(processedSidebars, options);
    }
    catch (err) {
        logger_1.default.error `Sidebars file at path=${sidebarFilePath} failed to be loaded.`;
        throw err;
    }
}
exports.loadSidebars = loadSidebars;
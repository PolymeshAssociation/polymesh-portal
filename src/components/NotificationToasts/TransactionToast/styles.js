"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyledTimestamp = exports.StyledError = exports.StyledLink = exports.StyledDetail = exports.StyledDetailsWrapper = exports.StyledStatusLabel = exports.StyledStatusWrapper = void 0;
var styled_components_1 = require("styled-components");
var types_1 = require("@polymeshassociation/polymesh-sdk/types");
exports.StyledStatusWrapper = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n"], ["\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n"])));
var handleStatusType = function (status) {
    switch (status) {
        case types_1.TransactionStatus.Unapproved:
            return "\n        background-color: #E6F9FE;\n        color: #046C7C;\n        ";
        case types_1.TransactionStatus.Running:
            return "\n        background-color: #170087;\n        color: #ffffff;\n        ";
        case types_1.TransactionStatus.Succeeded:
            return "\n        background-color: #D4F7E7;\n        color: #00AA5E;\n        ";
        case types_1.TransactionStatus.Rejected:
            return "\n        background-color: #FAE6E8;\n        color: #DB2C3E;\n        ";
        case types_1.TransactionStatus.Failed:
            return "\n        background-color: #FAE6E8;\n        color: #DB2C3E;\n        ";
        case types_1.TransactionStatus.Aborted:
            return "\n        background-color: #FBF3D0;\n        color: #E3A30C;\n        ";
        default:
            return '';
    }
};
exports.StyledStatusLabel = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  padding: 1px 8px;\n  border-radius: 100px;\n  font-weight: 500;\n  font-size: 10px;\n  ", "\n"], ["\n  padding: 1px 8px;\n  border-radius: 100px;\n  font-weight: 500;\n  font-size: 10px;\n  ", "\n"])), function (_a) {
    var status = _a.status;
    return handleStatusType(status);
});
exports.StyledDetailsWrapper = styled_components_1.default.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n"], ["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n"])));
exports.StyledDetail = styled_components_1.default.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  background-color: ", ";\n  color: ", ";\n  ", "\n"], ["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  background-color: ", ";\n  color: ", ";\n  ", "\n"])), function (_a) {
    var theme = _a.theme;
    return theme.colors.dashboardBackground;
}, function (_a) {
    var theme = _a.theme;
    return theme.colors.textSecondary;
}, function (_a) {
    var isIcon = _a.isIcon;
    return isIcon
        ? "\n    width: 32px;\n    border-radius: 50%;\n    "
        : "\n    flex-grow: 1;\n    border-radius: 32px;\n    font-weight: 500;\n    font-size: 12px;    \n    ";
});
exports.StyledLink = styled_components_1.default.a(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  width: 32px;\n  border-radius: 50%;\n  background-color: ", ";\n  color: ", ";\n"], ["\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 32px;\n  width: 32px;\n  border-radius: 50%;\n  background-color: ", ";\n  color: ", ";\n"])), function (_a) {
    var theme = _a.theme;
    return theme.colors.dashboardBackground;
}, function (_a) {
    var theme = _a.theme;
    return theme.colors.textSecondary;
});
exports.StyledError = styled_components_1.default.span(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  font-size: 12px;\n  color: #db2c3e;\n"], ["\n  font-size: 12px;\n  color: #db2c3e;\n"])));
exports.StyledTimestamp = styled_components_1.default.span(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  font-size: 12px;\n  color: ", ";\n"], ["\n  font-size: 12px;\n  color: ", ";\n"])), function (_a) {
    var theme = _a.theme;
    return theme.colors.textSecondary;
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calculus = void 0;
class Calculus {
    static integral(x, y) {
        let area = 0;
        for (var i = 0; i < y.length - 1; i++) {
            area += (x[i + 1] - x[i]) * (y[i] + y[i + 1]);
        }
        return area / 2;
    }
    static slope(x1, y1, x2, y2) {
        return (y2 - y1) / (x2 - x1);
    }
    static findFirstlocalMax(x) {
        let lm = 0;
        for (var i = 1; i < x.length - 1; ++i) {
            if (x[i - 1] < x[i] && x[i] > x[i + 1]) {
                lm = x[i];
                break;
            }
        }
        return lm;
    }
    static findIndexOfFirstlocalMax(x) {
        let ilm = 0;
        for (var i = 1; i < x.length - 1; ++i) {
            if (x[i - 1] < x[i] && x[i] > x[i + 1]) {
                ilm = i;
                break;
            }
        }
        return ilm;
    }
    static findMaxFromLocalMaxs(x) {
        let lms = [];
        for (var i = 1; i < x.length - 1; ++i) {
            if (x[i - 1] < x[i] && x[i] > x[i + 1]) {
                lms.push(x[i]);
            }
        }
        return lms.length > 0 ? Math.max(...lms) : 0;
    }
    static findIndexOfMaxFromLocalMaxs(x) {
        let lms = [];
        for (var i = 1; i < x.length - 1; ++i) {
            if (x[i - 1] < x[i] && x[i] > x[i + 1]) {
                lms.push(x[i]);
            }
        }
        return lms.length > 0 ? x.indexOf(Math.max(...lms)) : 0;
    }
}
exports.Calculus = Calculus;

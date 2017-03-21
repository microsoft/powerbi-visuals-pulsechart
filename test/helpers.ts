/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/// <reference path="_references.ts"/>

module powerbi.extensibility.visual.test.helpers {
    const EnglishAlphabetLowerCase = "abcdefghijklmnopqrstuwxyz";
    const EnglishAlphabetUpperCase = "ABCDEFGHIJKLMNOPQRSTUWXYZ";
    import helpers = powerbi.extensibility.utils.test.helpers;
    export function getRandomWords(
        wordCount: number,
        minLength: number,
        maxLength: number,
        alphabet: string | string[] = EnglishAlphabetLowerCase + EnglishAlphabetUpperCase): string[] {
        return _.range(wordCount).map(x => getRandomWord(minLength, maxLength, alphabet));
    }
    export function getHexColorFromNumber(value: number) {
        let hex: string = value.toString(16).toUpperCase();
        return "#" + (hex.length === 6 ? hex : _.range(0, 6 - hex.length, 0).join("") + hex);
    }
    export function getRandomInteger(min: number, max: number, exceptionList?: number[]): number {
        return helpers.getRandomNumber(max, min, exceptionList, Math.floor);
    }
    export function getRandomHexColor(): string {
        return getHexColorFromNumber(getRandomInteger(0, 16777215 + 1));
    }
    export function getRandomHexColors(count: number): string[] {
        return _.range(count).map(x => getRandomHexColor());
    }
    export function getRandomUniqueNumbers(count: number, min: number = 0, max: number = 1): number[] {
        let result: number[] = [];
        for (let i = 0; i < count; i++) {
            result.push(helpers.getRandomNumber(min, max, result));
        }

        return result;
    }
    export function getRandomUniqueDates(count: number, start: Date, end: Date): Date[] {
        return getRandomUniqueNumbers(count, start.getTime(), end.getTime()).map(x => new Date(x));
    }
    export function getRandomUniqueSortedDates(count: number, start: Date, end: Date): Date[] {
        return getRandomUniqueDates(count, start, end).sort((a, b) => a.getTime() - b.getTime());
    }
    export function getRandomWord(
        minLength: number,
        maxLength: number,
        alphabet: string | string[] = EnglishAlphabetLowerCase + EnglishAlphabetUpperCase): string {
        let alphabetLength = alphabet.length;
        let length = getRandomInteger(minLength, maxLength);
        let strings = <string[]>_.range(length).map(x => alphabet[getRandomInteger(0, alphabetLength)]);
        return strings.join('');
    }
    export function getRandomText(
        wordCount: number,
        minLength: number,
        maxLength: number,
        alphabet: string | string[] = EnglishAlphabetLowerCase + EnglishAlphabetUpperCase): string {
        return getRandomWords(wordCount, minLength, maxLength, alphabet).join(' ');
    }
}
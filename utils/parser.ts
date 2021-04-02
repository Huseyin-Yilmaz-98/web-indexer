import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import wordsToOmit from "./wordsToOmit.json";
import englishWords from "./englishWords.json";
import irregularNouns from "./irregularNouns.json";
import irregularVerbs from "./irregularVerbs.json";
import AbortController from "abort-controller";
import { IFrequency, TreePageData, FirstPageData } from "../interfaces";
import synonyms from "synonyms/src.json";

//throws a timeout exception if the request isnt fulfilled within the given time period
async function fetchWithTimeout(url: string, timeout = 20000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
        timeout,
        signal: controller.signal
    });

    clearTimeout(id);

    return response;
}

//returns the given url's html content and final url
export const getUrlContent = (url: string, timeout = 20000) => {
    return fetchWithTimeout(url, timeout).then(async res => {
        return {
            pageContent: await res.text(),
            pageLink: res.url
        }
    });
}

//extensions to omit when parsing sub links
const excludedUrlExtensions = ["mp4", "jpg", "jpeg", "png", "css", "js", "avi", "json", "ogg", "mkv", "ts", "mp3", "acc", "exe", "rar", "zip"]

//recursive function that 
export const processUrlTree = async (url: string, processedUrls: string[], numberOfKeywords: number, treePageDataArray: TreePageData[], firstPageData: FirstPageData, synonymCheck: boolean, linkLimit: number, depth = 1, referrer: string = "") => {
    if (processedUrls.includes(url)) {
        return;
    }
    processedUrls.push(url);
    try {
        const { pageContent, pageLink } = await getUrlContent(url, depth * 20000);
        const keywordCalculationResult = calculateKeywords(pageContent, numberOfKeywords, synonymCheck);
        let simplifiedFrequencies = synonymCheck ? reshapeFrequenciesListWithSynonyms(firstPageData.keywords, keywordCalculationResult.simplifiedFrequencies) : keywordCalculationResult.simplifiedFrequencies;
        const similarityCalculationResult = calculateSimilarity(firstPageData.percentage, firstPageData.keywords, simplifiedFrequencies);
        treePageDataArray.push({
            success: true,
            ...keywordCalculationResult,
            ...similarityCalculationResult,
            simplifiedFrequencies,
            simplifiedCount: getNumberOfTotalWords(simplifiedFrequencies),
            referrer,
            url,
            depth
        })
        try {
            if (depth < 3) {
                const baseUrl = new URL(pageLink);
                const links = keywordCalculationResult.pageLinks.filter(link => !link.startsWith("http") || link.includes("."))
                    .map(link => new URL(link, baseUrl.href))
                    .filter(linkUrl => linkUrl.origin === baseUrl.origin)
                    .map(linkUrl => linkUrl.href)
                    .filter(link => !excludedUrlExtensions.includes(link.toLowerCase().split(".").slice(-1)[0]))
                    .filter(link => !processedUrls.includes(link));
                await Promise.all([...new Set(links)].slice(0, linkLimit).map(async link => await processUrlTree(link, processedUrls, numberOfKeywords, treePageDataArray, firstPageData, synonymCheck, linkLimit, depth + 1, url)))
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    catch (error) {
        treePageDataArray.push({
            success: false,
            error: error.message,
            url,
            depth,
            referrer
        })
    }
}

//tags to omit while parsing text
const excludedTags = ["SCRIPT", "STYLE", "NOSCRIPT"];

//recursive function that receives a parent element and returns all text inside
const getElementText = (element: Element, text = "") => {
    Array.from(element.children).forEach(el => {
        text = getElementText(el, text);
        el.remove();
    });
    return text + (excludedTags.includes(element.nodeName) ? "" : (element.textContent + " "))
}

//returns all hrefs in an element
const getAllLinksInElement = (element: Element) => {
    return Array.from(element.querySelectorAll("a")).filter(el => el.href).map(el => el.href)
}

//splits the received string from "|"" and "-", then returns a list of unique words
export const getPageTitleWords = (pageTitle: string) => {
    let titleWords = simplifyText(pageTitle.split("|")[0]
        .split("-")[0])
        .split(" ")
        .filter(word => !wordsToOmit.includes(word));
    return titleWords.filter((item, pos) => titleWords.indexOf(item) === pos);
}

//receives an html string and returns the text, title and all sub urls in it
export const getPageData = (pageContent: string) => {
    const dom = new JSDOM(pageContent);
    const links = getAllLinksInElement(dom.window.document.body);
    const text = getElementText(dom.window.document.body);
    return {
        pageText: text.split(/\s+/).filter(word => word.length > 0).join(" "),
        pageTitle: dom.window.document.title,
        pageLinks: links
    };
}

//removes special characters in string and puts a single whitespace between each word
export const simplifyText = (text: string) => {
    let lowerCaseText = text.toLowerCase().replace(/n(’|')t/g, " ").replace(/(’|')(s|ve|ll|m|re|d)/g, " ");
    return lowerCaseText
        .replace(/[^\w\s]/gi, ' ')
        .split(/\s+/).filter(word => word.length > 0).join(" ");
}

//returns a list of synonyms for the given word
const getSynonyms = (word: string) => {
    let result: string[] = [];
    const wordData = (synonyms as any)[word];
    if (wordData) {
        for (let array in wordData) {
            result = result.concat(wordData[array].filter((el: string) => el.length > 1));
        }
    }
    return result;
}

//receives a string and returns each element's frequency as an array of objects
export const getFrequencies = (text: string, strict = false, synonymCheck = true) => {
    const simplified = simplifyText(text);
    const frequencies: IFrequency[] = [];
    let words = simplified.split(" ");

    let uniqueWords = [...new Set(words)]

    //if strict is set to true, singularize every word and convert past tense conjugated verbs into infinitive
    if (strict) {
        for (const word of uniqueWords) {
            const singular = singularizeWord(word, uniqueWords);
            if (singular !== word) {
                words = words.map(el => el === word ? singular : el);
            }
            else {
                const infinitive = toInfinitive(word, uniqueWords);
                if (infinitive !== word) {
                    words = words.map(el => el === word ? infinitive : el);
                }
            }
        }
        uniqueWords = [...new Set(words)];
    }

    //if synonymCheck is set to true, group all synonyms by first occurance
    if (synonymCheck) {
        const uniqueWordsCopy = [...uniqueWords];
        uniqueWords = []
        for (const word of uniqueWordsCopy) {
            if (words.includes(word)) {
                const synonyms = getSynonyms(word);
                words = words.map(el => synonyms.includes(el) ? word : el);
                uniqueWords.push(word)
            }
        }
    }

    for (const word of uniqueWords) {
        frequencies.push({
            word,
            frequency: words.filter(element => element === word).length
        })
    }

    return frequencies.sort((a, b) => b.frequency - a.frequency);
}

//converts given string into infinitive form if it is past tense conjugated
export const toInfinitive = (word: string, uniqueWords: string[]) => {
    const irregular = irregularVerbs.find(el => el.conjugatedForms.includes(word));
    if (irregular) {
        return irregular.infinitive;
    }
    if (word.endsWith("ed")) {
        let replacement;
        if (word.match(/([a-z])\1ed/)) {
            replacement = word.substring(0, word.length - 3);
        }
        else if (word.endsWith("ied")) {
            replacement = word.substring(0, word.length - 3) + "y";
        }
        else {
            replacement = word.substring(0, word.length - 2);
        }
        if (uniqueWords.includes(replacement) || englishWords.includes(replacement)) {
            return replacement;
        }
        replacement = word.substring(0, word.length - 1);
        if (uniqueWords.includes(replacement) || englishWords.includes(replacement)) {
            return replacement;
        }
    }
    return word;
}

//singularizes word if it is plural
export const singularizeWord = (word: string, uniqueWords: string[] = []) => {
    const irregular = irregularNouns.find(el => word === el.plural);
    let replacement;
    if (irregular) {
        return irregular.singular;
    }
    else if ((word.length <= 3 && englishWords.includes(word)) || word.endsWith("ss")) {
        return word;
    }
    else if (word.endsWith("ies")) {
        replacement = word.substring(0, word.length - 3) + "y";
    }
    else if (word.endsWith("oes")) {
        replacement = word.substring(0, word.length - 2);
    }
    else if (word.endsWith("s")) {
        replacement = word.substring(0, word.length - 1);
    }
    if (replacement && (uniqueWords.includes(replacement) || englishWords.includes(replacement))) {
        return replacement;
    }
    return word;
}

//returns a new frequency array removing omitted words and numbers and single char strings
export const simplifyFrequenciesList = (frequencies: IFrequency[]) => {
    return frequencies
        .filter(element => !wordsToOmit.includes(element.word) && isNaN(element.word as any) && element.word.length > 1)
}

//receives html string and returns keywords, frequencies, simplified requencies, page title and page links
export const calculateKeywords = (pageContent: string, requestedNumber = 10, synonymCheck = false) => {
    const { pageText, pageTitle, pageLinks } = getPageData(pageContent);
    let titleWords = getPageTitleWords(pageTitle);
    const frequencies = getFrequencies(pageText, true, synonymCheck);
    const simplifiedFrequencies = simplifyFrequenciesList(frequencies);
    let keywords = simplifiedFrequencies.filter(el => el.frequency === simplifiedFrequencies[0].frequency);
    let simplifiedFrequenciesWithoutKeywords = simplifiedFrequencies.filter(el => !keywords.map(element => element.word).includes(el.word));
    titleWords = titleWords.filter(word => !keywords.map(element => element.word).includes(word));

    //mark words in page title as keyword if their frequency is in the top 5%
    titleWords.forEach(word => {
        const frequency = simplifiedFrequenciesWithoutKeywords.find(el => el.word === word);
        if (frequency && simplifiedFrequenciesWithoutKeywords.indexOf(frequency) <= (simplifiedFrequenciesWithoutKeywords.length / 20)) {
            keywords.push(simplifiedFrequenciesWithoutKeywords.splice(simplifiedFrequenciesWithoutKeywords.indexOf(frequency), 1)[0]);
        }
    });

    while (keywords.length < requestedNumber && simplifiedFrequenciesWithoutKeywords.length > 0) {
        keywords = keywords.concat(simplifiedFrequenciesWithoutKeywords.filter(el => el.frequency === simplifiedFrequenciesWithoutKeywords[0].frequency));
        simplifiedFrequenciesWithoutKeywords = simplifiedFrequenciesWithoutKeywords.filter(el => !keywords.map(element => element.word).includes(el.word));
    }

    return { keywords, frequencies, simplifiedFrequencies, pageTitle, pageLinks };
}

//returns total word count in frequency array
export const getNumberOfTotalWords = (frequencies: IFrequency[]) => {
    return frequencies.map(el => el.frequency).reduce((total, current) => total + current);
}

//replaces words with those in first pages keywords if they are synonyms
const reshapeFrequenciesListWithSynonyms = (firstPageKeywords: IFrequency[], secondPageSimplifiedFrequencies: IFrequency[]) => {
    const synonymsData = firstPageKeywords.map(el => {
        return {
            word: el.word,
            synonyms: getSynonyms(el.word)
        }
    });
    return secondPageSimplifiedFrequencies.map(el => {
        const getSynonymWord = synonymsData.find(element => element.synonyms.includes(el.word));
        if (getSynonymWord) {
            return {
                word: getSynonymWord.word,
                frequency: el.frequency
            }
        }
        else {
            return el;
        }
    })
}

//calculates similarity between two pages based on the percentage of first page's keywords in both pages
export const calculateSimilarity = (firstPagePercentage: number, firstPageKeywords: IFrequency[], secondPageSimplifiedFrequencies: IFrequency[]) => {
    const secondPageCount = getNumberOfTotalWords(secondPageSimplifiedFrequencies);

    const secondPagePercentage = firstPageKeywords.map(el => el.word).map(word => {
        const secondPageFrequency = secondPageSimplifiedFrequencies.find(el => el.word === word);
        return secondPageFrequency ? secondPageFrequency.frequency : 0;
    }).reduce((sum, current) => sum + current) / secondPageCount * 100;

    return {
        percentage: secondPagePercentage,
        similarity: (firstPagePercentage > secondPagePercentage ? secondPagePercentage / firstPagePercentage : firstPagePercentage / secondPagePercentage) * 100
    };
}
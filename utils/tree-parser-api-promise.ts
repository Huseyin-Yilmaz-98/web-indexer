import { NextApiRequest, NextApiResponse } from 'next';
import { FirstPageData, PageType, TreePageData, TreePageDatasObject, TreeParserResponse } from '../interfaces';
import { getUrlContent, calculateKeywords, getNumberOfTotalWords, processUrlTree } from '../utils/parser';


export default (req: NextApiRequest, res: NextApiResponse, synonymCheck: boolean) => {
    return new Promise<void>((resolve) => {
        if (req.method === "POST") {
            const { firstUrl, rootUrls, numberOfKeywords, linkLimit } = req.body;
            console.log(`Starting to parse first url:  ${firstUrl}`);
            getUrlContent(firstUrl).then(result => {
                const firstPageContent = result.pageContent;
                const fpCalculationResults = calculateKeywords(firstPageContent, numberOfKeywords, synonymCheck);
                const fpPercentage = getNumberOfTotalWords(fpCalculationResults.keywords) / getNumberOfTotalWords(fpCalculationResults.simplifiedFrequencies) * 100;

                const firstPageData: FirstPageData = {
                    pageType: PageType.FIRST_PAGE,
                    ...fpCalculationResults,
                    simplifiedCount: getNumberOfTotalWords(fpCalculationResults.simplifiedFrequencies),
                    percentage: fpPercentage
                };

                console.log(`Parsing first url ${firstUrl} is complete...`);

                const treePageDatasObjects: TreePageDatasObject[] = [];
                Promise.all(rootUrls.map(async (url: string) => {
                    const treePageDatas: TreePageData[] = [];
                    const processedUrls: string[] = [];
                    console.log(`Starting to parse ${url}...`);
                    await processUrlTree(url, processedUrls, numberOfKeywords, treePageDatas, firstPageData, synonymCheck, linkLimit);
                    treePageDatas.sort((a, b) => (b.success ? b.similarity : 0) - (a.success ? a.similarity : 0))
                    console.log(`Parsing ${url} is complete...`);

                    const overallSimilarity =
                        (treePageDatas.map(el => el.success ? (el.similarity * (4 - el.depth)) : 0).reduce((total, current) => total + current)
                            / treePageDatas.map(el => el.success ? (4 - el.depth) : 0).reduce((total, current) => total + current)) || 0;
                            
                    treePageDatasObjects.push({
                        rootUrl: url,
                        overallSimilarity,
                        treePageDatas
                    });
                })).then(() => {
                    treePageDatasObjects.sort((a, b) => b.overallSimilarity - a.overallSimilarity);
                    const response: TreeParserResponse = {
                        success: true,
                        firstPageData,
                        treePageDatasObjects
                    }
                    res.json(response);
                    resolve();
                })
            }).catch(err => {
                const response: TreeParserResponse = {
                    success: false,
                    error: err.message
                }
                res.json(response);
                resolve();
            })
        }
        else {
            res.send("Only POST requests are accepted!");
            resolve();
        }
    });
}
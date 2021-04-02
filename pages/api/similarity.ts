import { NextApiRequest, NextApiResponse } from 'next';
import { FirstPageData, PageType, SecondPageData, SimilarityResponse } from '../../interfaces';
import { calculateKeywords, calculateSimilarity, getNumberOfTotalWords, getUrlContent } from '../../utils/parser';

export default (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
        if (req.method === "POST") {
            const { firstUrl, secondUrl, numberOfKeywords } = req.body;
            let firstPageContent: string;
            let secondPageContent: string;

            const getFirstUrlContent = new Promise<void>((resolve, reject) => {
                getUrlContent(firstUrl).then(result => {
                    firstPageContent = result.pageContent;
                    resolve();
                }).catch(err => reject(err));
            })

            const getSecondUrlContent = new Promise<void>((resolve, reject) => {
                getUrlContent(secondUrl).then(result => {
                    secondPageContent = result.pageContent;
                    resolve();
                }).catch(err => reject(err));
            })

            let response: SimilarityResponse;

            Promise.all([getFirstUrlContent, getSecondUrlContent])
                .then(() => {
                    const fpCalculationResults = calculateKeywords(firstPageContent, numberOfKeywords);
                    const fpPercentage = getNumberOfTotalWords(fpCalculationResults.keywords) / getNumberOfTotalWords(fpCalculationResults.simplifiedFrequencies) * 100;
                    
                    const firstPageData: FirstPageData = {
                        pageType: PageType.FIRST_PAGE,
                        ...fpCalculationResults,
                        simplifiedCount: getNumberOfTotalWords(fpCalculationResults.simplifiedFrequencies),
                        percentage: fpPercentage
                    };

                    const spCalculationResults = calculateKeywords(secondPageContent, numberOfKeywords);
                    const spSimilarityCalculationResults = calculateSimilarity(fpPercentage, fpCalculationResults.keywords, spCalculationResults.simplifiedFrequencies);

                    const secondPageData: SecondPageData = {
                        pageType: PageType.SECOND_PAGE,
                        ...spCalculationResults,
                        ...spSimilarityCalculationResults,
                        simplifiedCount: getNumberOfTotalWords(spCalculationResults.simplifiedFrequencies)
                    };

                    response = {
                        success: true,
                        firstPageData,
                        secondPageData
                    };
                }).catch(err => {
                    response = {
                        success: false,
                        error: err.message
                    };
                }).finally(() => {
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
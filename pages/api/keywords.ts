import { NextApiRequest, NextApiResponse } from 'next';
import { KeywordsResponse } from '../../interfaces';
import { calculateKeywords, getUrlContent } from '../../utils/parser';

export default (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
        if (req.method === "POST") {
            const { url, numberOfKeywords } = req.body;
            let finalResponse: KeywordsResponse;
            getUrlContent(url).then(response => {
                const { pageContent } = response;
                const { keywords, frequencies, simplifiedFrequencies, pageTitle } = calculateKeywords(pageContent, numberOfKeywords);
                finalResponse = {
                    success: true,
                    keywords,
                    frequencies,
                    simplifiedFrequencies,
                    pageTitle
                }
            }).catch(err => {
                finalResponse = {
                    success: false,
                    error: err.message
                }
            }).finally(() => {
                res.json(finalResponse);
                resolve();
            });
        }
        else {
            res.send("Only POST requests are accepted!")
            resolve();
        }
    })
}
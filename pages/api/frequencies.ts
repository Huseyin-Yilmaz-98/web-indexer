import { NextApiRequest, NextApiResponse } from 'next';
import { FrequenciesResponse } from '../../interfaces';
import { getFrequencies, getPageData, getUrlContent } from '../../utils/parser';

export default (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise<void>((resolve) => {
        if (req.method === "POST") {
            const { url} = req.body;
            let finalResponse: FrequenciesResponse;

            getUrlContent(url).then(response => {
                const { pageContent } = response;
                const { pageText } = getPageData(pageContent);
                const frequencies = getFrequencies(pageText, true);
                finalResponse = {
                    success: true,
                    data: frequencies
                };
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
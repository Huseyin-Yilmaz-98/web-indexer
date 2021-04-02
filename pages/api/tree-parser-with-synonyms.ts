import { NextApiRequest, NextApiResponse } from 'next';
import treeParserApiPromise from "../../utils/tree-parser-api-promise";


export default (req: NextApiRequest, res: NextApiResponse) => {
    return treeParserApiPromise(req, res, true);
}
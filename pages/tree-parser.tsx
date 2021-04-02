import Layout from '../components/Layout';
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { jsonFetch } from "../utils/fetch";
import Form from '../components/Form';
import TextInput from '../components/TextInput';
import styled from 'styled-components';
import { FirstPageData, TreePageDatasObject, TreeParserResponse } from '../interfaces';
import TreeView from '../components/TreeView';

const NewLink = styled.a`
color: white;
cursor: pointer;
margin: 0px 0px 2em 0px;
`;

const TreeParserPage = () => {
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstUrl, setFirstUrl] = useState("");
    const [warning, setWarning] = useState("");
    const [numberOfKeywords, setNumberOfKeywords] = useState("10");
    const [linkLimit, setLinkLimit] = useState("5");
    const [rootUrls, setRootUrls] = useState<string[]>([""]);
    const [firstPageData, setFirstPageData] = useState<FirstPageData>();
    const [treePageDatasObjects, setTreePageDatasObjects] = useState<TreePageDatasObject[]>();

    const onSubmit = () => {
        setWarning("");
        setLoading(true);
        jsonFetch("/api/tree-parser", { firstUrl, rootUrls: rootUrls.filter(rootUrl => rootUrl), numberOfKeywords, linkLimit })
            .then((res: TreeParserResponse) => {
                if (res.success) {
                    setFirstPageData(res.firstPageData);
                    setTreePageDatasObjects(res.treePageDatasObjects);
                    setShowResults(true);
                }
                else {
                    setWarning(res.error);
                }
            })
            .finally(() => setLoading(false));
    }

    const onRootUrlChange = (url: string, index: number) => {
        const newRootUrls = [...rootUrls];
        newRootUrls[index] = url;
        setRootUrls(newRootUrls);
    }

    const createNewUrlInput = () => {
        const newRootUrls = [...rootUrls];
        newRootUrls.push("");
        setRootUrls(newRootUrls);
    }

    return (
        <Layout title="Tree Parser">
            { loading && <Spinner />}
            {
                showResults && firstPageData && treePageDatasObjects
                    ? <TreeView firstPageData={firstPageData} treePageDatasObjects={treePageDatasObjects} firstPageUrl={firstUrl} synonymCheck = {false}>

                    </TreeView>
                    : <Form onSubmit={onSubmit} formTitle="Calculate Keywords On Link Tree" warning={warning}>
                        <TextInput label="First Url" setText={setFirstUrl} id="firstUrl"></TextInput>
                        <TextInput inputType="number" label="Number Of Keywords" setText={setNumberOfKeywords} id="numberOfKeywords" defaultValue={numberOfKeywords}></TextInput>
                        <TextInput inputType="number" label="Sub Link Limit" setText={setLinkLimit} id="linkLimit" defaultValue={linkLimit}></TextInput>
                        {
                            rootUrls.map((_, i) => {
                                return (
                                    <React.Fragment key={i}>
                                        <TextInput label={`Root Url ${i + 1}`} setRootUrl={(url: string) => onRootUrlChange(url, i)} id={`rootUrl_${i + 1}`} />
                                        {i === rootUrls.length - 1 && <NewLink onClick={createNewUrlInput}>New Root Url</NewLink>}
                                    </React.Fragment>
                                )
                            })
                        }
                    </Form>
            }

        </Layout>
    )
}

export default TreeParserPage;
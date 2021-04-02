import Layout from '../components/Layout'
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { jsonFetch } from "../utils/fetch";
import { IFrequency, KeywordsResponse } from "../interfaces";
import Form from "../components/Form";
import TextInput from "../components/TextInput";
import MultiFrequenciesTable from '../components/MultiFrequenciesTable';

const KeywordsPage = () => {
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");
    const [warning, setWarning] = useState("");
    const [keywords, setKeywords] = useState<IFrequency[]>([]);
    const [frequencies, setFrequencies] = useState<IFrequency[]>([]);
    const [simplifiedFrequencies, setSimplifiedFrequencies] = useState<IFrequency[]>([]);
    const [pageTitle, setPageTitle] = useState("");
    const [numberOfKeywords, setNumberOfKeywords] = useState("7");


    const onSubmit = () => {
        setWarning("");
        setLoading(true);
        jsonFetch("/api/keywords", { url, numberOfKeywords })
            .then((res: KeywordsResponse) => {
                if (res.success) {
                    setKeywords(res.keywords);
                    setFrequencies(res.frequencies);
                    setSimplifiedFrequencies(res.simplifiedFrequencies);
                    setPageTitle(res.pageTitle)
                    setShowResults(true);
                }
                else {
                    setWarning(res.error);
                }
            })
            .finally(() => setLoading(false));
    }

    return (
        <Layout title="Frequencies">
            { loading && <Spinner />}
            {
                showResults
                    ?
                    <MultiFrequenciesTable keywords={keywords} frequencies={frequencies} simplifiedFrequencies={simplifiedFrequencies} >
                        <p>Url: <a href={url}>{url}</a></p>
                        <p>Title: {pageTitle.split(/-|\|/)[0]}</p>
                    </MultiFrequenciesTable>
                    :
                    <Form onSubmit={onSubmit} formTitle="Calculate Keywords" warning={warning}>
                        <TextInput label="Url" setText={setUrl} id="url"></TextInput>
                        <TextInput inputType="number" label="Number Of Keywords" setText={setNumberOfKeywords} id="numberOfKeywords" defaultValue={numberOfKeywords}></TextInput>
                    </Form>
            }
        </Layout>
    )
}

export default KeywordsPage;

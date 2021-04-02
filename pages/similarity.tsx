import Layout from '../components/Layout'
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { jsonFetch } from "../utils/fetch";
import { FirstPageData, SecondPageData, SimilarityResponse } from "../interfaces";
import Form from "../components/Form";
import TextInput from "../components/TextInput";
import MultiFrequenciesTable from '../components/MultiFrequenciesTable';
import styled from "styled-components";

const OuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1{
        color: #d8a8a8;
        margin-bottom: 1em;
    }
`;

const TablesContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
`;

const SimilarityPage = () => {
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [firstUrl, setFirstUrl] = useState("");
    const [secondUrl, setSecondUrl] = useState("");
    const [warning, setWarning] = useState("");
    const [firstPageData, setFirstPageData] = useState<FirstPageData>();
    const [secondPageData, setSecondPageData] = useState<SecondPageData>();
    const [numberOfKeywords, setNumberOfKeywords] = useState("7");


    const onSubmit = () => {
        setWarning("");
        setLoading(true);
        jsonFetch("/api/similarity", { firstUrl, secondUrl, numberOfKeywords })
            .then((res: SimilarityResponse) => {
                if (res.success) {
                    setFirstPageData(res.firstPageData);
                    setSecondPageData(res.secondPageData);
                    setShowResults(true);
                }
                else {
                    setWarning(res.error);
                }
            })
            .finally(() => setLoading(false));
    }

    return (
        <Layout title="Similarity">
            { loading && <Spinner />}
            {
                showResults && firstPageData !== undefined && secondPageData !== undefined
                    ?
                    <OuterContainer>
                        <h1>Similarity: {secondPageData.similarity.toFixed(2)}%</h1>
                        <TablesContainer>
                            <MultiFrequenciesTable tableId="1" keywords={firstPageData.keywords} frequencies={firstPageData.frequencies} simplifiedFrequencies={firstPageData.simplifiedFrequencies}>
                                <p>Url: <a href={firstUrl} target="_blank">{firstUrl}</a></p>
                                <p>Title: {firstPageData.pageTitle.split(/-|\|/)[0]}</p>
                                <p>First Page Keywords Percentage: {firstPageData.percentage.toFixed(2)}%</p>
                            </MultiFrequenciesTable>
                            <MultiFrequenciesTable tableId="2" keywords={secondPageData.keywords} frequencies={secondPageData.frequencies} simplifiedFrequencies={secondPageData.simplifiedFrequencies}>
                                <p>Url: <a href={secondUrl} target="_blank">{secondUrl}</a></p>
                                <p>Title: {secondPageData.pageTitle.split(/-|\|/)[0]}</p>
                                <p>First Page Keywords Percentage: {secondPageData.percentage.toFixed(2)}%</p>
                            </MultiFrequenciesTable>
                        </TablesContainer>
                    </OuterContainer>
                    :
                    <Form onSubmit={onSubmit} formTitle="Calculate Similarity" warning={warning}>
                        <TextInput label="First Url" setText={setFirstUrl} id="firstUrl"></TextInput>
                        <TextInput label="Second Url" setText={setSecondUrl} id="secondUrl"></TextInput>
                        <TextInput inputType="number" label="Number Of Keywords" setText={setNumberOfKeywords} id="numberOfKeywords" defaultValue={numberOfKeywords}></TextInput>
                    </Form>
            }
        </Layout>
    )
}

export default SimilarityPage;

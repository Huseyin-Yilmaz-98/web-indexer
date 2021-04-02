import Layout from '../components/Layout'
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { jsonFetch } from "../utils/fetch";
import { FrequenciesResponse, IFrequency } from "../interfaces";
import Form from "../components/Form";
import TextInput from "../components/TextInput";
import FrequenciesTable from '../components/FrequenciesTable';

const FrequenciesPage = () => {
    const [frequencyData, setfrequencyData] = useState<IFrequency[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");
    const [warning, setWarning] = useState("");

    const onSubmit = () => {
        setWarning("");
        setLoading(true);
        jsonFetch("/api/frequencies", { url })
            .then((res: FrequenciesResponse) => {
                if (res.success) {
                    setfrequencyData(res.data);
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
                    <FrequenciesTable frequencyData={frequencyData} >
                        <p>Url: <a href={url}>{url}</a></p>
                    </FrequenciesTable>
                    :
                    <Form onSubmit={onSubmit} formTitle="Calculate Frequencies" warning={warning}>
                        <TextInput label="Url" setText={setUrl} id="url"></TextInput>
                    </Form>
            }

        </Layout>
    )
}

export default FrequenciesPage;

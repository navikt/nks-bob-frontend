import { useState } from "react";
import { HStack, Button, Textarea, BodyShort, VStack, Link } from "@navikt/ds-react";
import { PaperplaneIcon } from '@navikt/aksel-icons';

import './InputField.css';

function InputField() {
    const [inputValue, setInputValue] = useState('Spør Bob om noe...');

    function handleInputValue(e) {
        setInputValue(e.target.value);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log(inputValue);
        }
    }

    function handleClick() {
        console.log(inputValue)
    }

    return (
        <div className="fixed-input">
            <VStack align="stretch" gap="5">
                <HStack gap="2">
                    <Textarea
                        size="small"
                        label=""
                        hideLabel
                        className="flex-grow"
                        minRows={1}
                        maxRows={10}
                        value={inputValue}
                        onChange={handleInputValue}
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        icon={<PaperplaneIcon
                            title="Historikk" />}
                        variant="primary"
                        size="small"
                        className="max-h-8"
                        onClick={handleClick}
                    />
                </HStack>
                <BodyShort size="small" align="center">
                    Bob baserer svarene på informasjonen fra <Link
                    href="https://data.ansatt.nav.no/quarto/e7b3e02a-0c45-4b5c-92a2-a6d364120dfb/index.html"
                >
                    nks kunnskapsartikler
                </Link>.
                </BodyShort>
            </VStack>
        </div>
    );
};

export default InputField
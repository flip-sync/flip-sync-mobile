export type ScoreCodeOption = {
    label: string;
    value: string;
};

const BASE_SCORE_CODES = [
    "C",
    "Cm",
    "C#",
    "C#m",
    "Db",
    "Dbm",
    "D",
    "Dm",
    "Eb",
    "Ebm",
    "E",
    "Em",
    "F",
    "Fm",
    "F#",
    "F#m",
    "Gb",
    "Gbm",
    "G",
    "Gm",
    "Ab",
    "Abm",
    "A",
    "Am",
    "Bb",
    "Bbm",
    "B",
    "Bm"
] as const;

export const SCORE_CODE_OPTIONS: ScoreCodeOption[] = BASE_SCORE_CODES.map(code => ({
    label: code,
    value: code
}));

export const findScoreCodeLabel = (value?: string | null) => {
    if (!value) {
        return "";
    }

    return SCORE_CODE_OPTIONS.find(option => option.value === value)?.label ?? value;
};

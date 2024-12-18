module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',  
    rules: {
        /*
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        */ 
        "padding-line-between-statements": [
            "error",
            {
                "blankLine": "always",
                "prev": "*",
                "next": "return"
            },
            {
                "blankLine": "always",
                "prev": [
                    "const",
                    "let",
                    "var",
                    "import"
                ],
                "next": "*"
            },
            {
                "blankLine": "always",
                "prev": "*",
                "next": [
                    "for",
                    "switch",
                    "if",
                    "try"
                ]
            },
            {
                "blankLine": "always",
                "prev": "*",
                "next": "export"
            },
            {
                "blankLine": "always",
                "prev": "*",
                "next": "function"
            },
            {
                "blankLine": "any",
                "prev": [
                    "const",
                    "let",
                    "var"
                ],
                "next": [
                    "const",
                    "let",
                    "var"
                ]
            },
            {
                "blankLine": "any",
                "prev": [
                    "import"
                ],
                "next": [
                    "import"
                ]
            },
            {
                "blankLine": "any",
                "prev": [
                    "export"
                ],
                "next": [
                    "export"
                ]
            }
        ],
        "no-unused-vars": "off",
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1
            }
        ],
        "eol-last": [
            "error",
            "never"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "never"
        ],
        "react-hooks/rules-of-hooks": "error",
        "react/prop-types": "off",
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "prefer-const": "off",
        "@typescript-eslint/no-explicit-any": "off"
    },
}

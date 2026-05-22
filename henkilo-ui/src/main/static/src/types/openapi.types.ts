export type OpenApiHttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export type OpenApiOperation = {
    summary?: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    extensions?: Record<string, unknown>;
    'x-preauthorize'?: string;
    'x-postauthorize'?: string;
    xPreauthorize?: string;
    xPostauthorize?: string;
};

export type OpenApiDocument = {
    paths?: Record<string, Partial<Record<OpenApiHttpMethod, OpenApiOperation>>>;
};

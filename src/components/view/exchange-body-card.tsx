import * as _ from 'lodash';
import * as React from 'react';
import { observable, autorun, action } from 'mobx';
import { disposeOnUnmount, observer } from 'mobx-react';
import { SchemaObject } from 'openapi-directory';
import * as portals from 'react-reverse-portal';

import { ExchangeMessage } from '../../types';
import { styled } from '../../styles';
import { lastHeader } from '../../util';

import { ViewableContentType, getCompatibleTypes, getContentEditorName } from '../../model/http/content-types';
import { getReadableSize } from '../../model/http/bodies';

import { CollapsibleCardHeading, CardButtons } from '../common/card';
import { ExchangeCard, LoadingExchangeCard } from './exchange-card';
import { Pill, PillSelector } from '../common/pill';
import { CopyButtonIcon } from '../common/copy-button';
import { ExpandShrinkButton } from '../common/expand-shrink-button';
import { ContentViewer } from '../editor/content-viewer';
import { ThemedSelfSizedEditor } from '../editor/base-editor';

const EditorCardContent = styled.div`
    margin: 0 -20px -20px -20px;
    border-top: solid 1px ${p => p.theme.containerBorder};
    background-color: ${p => p.theme.highlightBackground};
    color: ${p => p.theme.highlightColor};

    .monaco-editor-overlaymessage {
        display: none;
    }

    position: relative;
    flex-grow: 1;
`;

const CopyBody = styled(CopyButtonIcon)`
    padding: 5px 10px;
`;

const ExchangeBodyCardCard = styled(ExchangeCard)`
    display: flex;
    flex-direction: column;
`;

@observer
export class ExchangeBodyCard extends React.Component<{
    title: string,
    direction: 'left' | 'right',
    collapsed: boolean,
    expanded: boolean,
    onCollapseToggled: () => void,
    onExpandToggled: () => void,

    message: ExchangeMessage,
    apiBodySchema?: SchemaObject,
    editorNode: portals.HtmlPortalNode<typeof ThemedSelfSizedEditor>
}> {

    @observable
    private selectedContentType: ViewableContentType | undefined;

    /*
     * Bit of a hack... We pass an observable down into the child editor component, who
     * writes to it when they've got rendered content (or not), which automatically
     * updates the copy button's rendered content.
     */
    private currentContent = observable.box<string | undefined>();

    componentDidMount() {
        disposeOnUnmount(this, autorun(() => {
            const message = this.props.message;

            if (!message) {
                this.setContentType(undefined);
                return;
            }
        }));
    }

    @action.bound
    setContentType(contentType: ViewableContentType | undefined) {
        if (contentType === this.props.message.contentType) {
            this.selectedContentType = undefined;
        } else {
            this.selectedContentType = contentType;
        }
    }

    render() {
        const {
            title,
            message,
            apiBodySchema,
            direction,
            collapsed,
            expanded,
            onCollapseToggled,
            onExpandToggled
        } = this.props;

        const compatibleContentTypes = getCompatibleTypes(
            message.contentType,
            lastHeader(message.headers['content-type']),
            message.body
        );
        const contentType = _.includes(compatibleContentTypes, this.selectedContentType) ?
            this.selectedContentType! : message.contentType;

        const decodedBody = message.body.decoded;

        const currentRenderedContent = this.currentContent.get();

        return decodedBody ?
            <ExchangeBodyCardCard
                direction={direction}
                collapsed={collapsed}
                onCollapseToggled={onCollapseToggled}
                expanded={expanded}
            >
                <header>
                    <CardButtons>
                        <ExpandShrinkButton
                            expanded={expanded}
                            onClick={onExpandToggled}
                        />

                        { !collapsed && currentRenderedContent &&
                            // Can't show when collapsed, because no editor means the content might be outdated...
                            // TODO: Fine a nicer solution that doesn't depend on the editor
                            // Maybe refactor content rendering out, and pass the rendered result _down_ instead?
                            <CopyBody content={currentRenderedContent} />
                        }
                    </CardButtons>
                    <Pill>{ getReadableSize(decodedBody.byteLength) }</Pill>
                    <PillSelector<ViewableContentType>
                        onChange={this.setContentType}
                        value={contentType}
                        options={compatibleContentTypes}
                        nameFormatter={getContentEditorName}
                    />
                    <CollapsibleCardHeading onCollapseToggled={onCollapseToggled}>
                        { title }
                    </CollapsibleCardHeading>
                </header>
                <EditorCardContent>
                    <ContentViewer
                        editorNode={this.props.editorNode}
                        rawContentType={lastHeader(message.headers['content-type'])}
                        contentType={contentType}
                        contentObservable={this.currentContent}
                        schema={apiBodySchema}
                        expanded={!!expanded}
                    >
                        {decodedBody}
                    </ContentViewer>
                </EditorCardContent>
            </ExchangeBodyCardCard>
        :
            <LoadingExchangeCard
                direction={direction}
                collapsed={collapsed}
                onCollapseToggled={onCollapseToggled}
                expanded={!!expanded}
                height={expanded ? 'auto' : '500px'}
            >
                <header>
                    <PillSelector<ViewableContentType>
                        onChange={this.setContentType}
                        value={contentType}
                        options={compatibleContentTypes}
                        nameFormatter={getContentEditorName}
                    />
                    <CollapsibleCardHeading onCollapseToggled={onCollapseToggled}>
                        { title }
                    </CollapsibleCardHeading>
                </header>
            </LoadingExchangeCard>;
    }

}
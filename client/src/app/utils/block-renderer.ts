import { Type } from '@angular/core';
import { ButtonBlockComponent } from '../components/blocks/button-block/button-block.component';
import { ImageBlockComponent } from '../components/blocks/image-block/image-block.component';
import { TextBlockComponent } from '../components/blocks/text-block/text-block.component';
import { DividerBlockComponent } from '../components/blocks/divider-block/divider-block.component';
import { SpacerBlockComponent } from '../components/blocks/spacer-block/spacer-block.component';
import { VideoBlockComponent } from '../components/blocks/video-block/video-block.component';
import { ColumnsBlockComponent } from '../components/blocks/columns-block/columns-block.component';
import { CardBlockComponent } from '../components/blocks/card-block/card-block.component';
import { FormBlockComponent } from '../components/blocks/form-block/form-block.component';
import { IconBlockComponent } from '../components/blocks/icon-block/icon-block.component';
import { HtmlBlockComponent } from '../components/blocks/html-block/html-block.component';
import { MapBlockComponent } from '../components/blocks/map-block/map-block.component';
import { BlockType } from '../store/builder.models';

export function resolveBlockComponent(type: BlockType): Type<any> | null {
  switch (type) {
    case 'text':
    case 'heading':
      return TextBlockComponent;
    case 'image':
      return ImageBlockComponent;
    case 'button':
      return ButtonBlockComponent;
    case 'divider':
      return DividerBlockComponent;
    case 'spacer':
      return SpacerBlockComponent;
    case 'video':
      return VideoBlockComponent;
    case 'columns':
      return ColumnsBlockComponent;
    case 'card':
      return CardBlockComponent;
    case 'form':
      return FormBlockComponent;
    case 'icon':
      return IconBlockComponent;
    case 'html':
      return HtmlBlockComponent;
    case 'map':
      return MapBlockComponent;
    case 'section':
    default:
      return null;
  }
}

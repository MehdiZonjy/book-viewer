import {IDisposable, Texture} from '../core';
import {AtlasTextureEntry} from './atlas-entry';
/**
 * holds a sprite sheet coords and texture
 * 
 * @export
 * @class Atlas
 * @implements {IDisposable}
 */
export class Atlas implements IDisposable {
    private mDisposed: boolean;
    constructor(private mAtlasTexture: Texture, private mEntries: AtlasTextureEntry[]) {
        this.convertToTexcoord();
    }
    /**
     * parses sprite sheet entries and calculates bounds of each sub-sprite
     * 
     * @private
     */
    private convertToTexcoord() {
        const atlasWidth = this.mAtlasTexture.Width;
        const atlasHeight = this.mAtlasTexture.Height;
        for (let i = 0, l = this.mEntries.length; i < l; i++) {
            const entry = this.mEntries[i];
            entry._x /= atlasWidth;
            entry._y /= atlasHeight;
            entry._width /= atlasWidth;
            entry._height /= atlasHeight;
        }
    }

    /**
     * sprites counts 
     * 
     * @readonly
     * @type {number}
     */
    public get EntriesCount(): number {
        return this.mEntries.length;
    }

    /**
     * get AtlasTextureEntry with index 
     * 
     * @param {number} index
     * @returns {AtlasTextureEntry}
     */
    public getEntry(index: number): AtlasTextureEntry {
        return this.mEntries[index];
    }
    /**
     * cleans texture
     * 
     * @returns
     */
    public dispose() {
        if (this.mDisposed)
            return;
        this.mAtlasTexture.dispose();
        this.mDisposed = true;
    }
    public getTexture() {
        return this.mAtlasTexture;
    }


}
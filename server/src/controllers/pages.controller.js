const Page = require('../models/Page.model');
const { apiCache } = require('../middleware/cache.middleware');

const DEFAULT_USER_ID = '000000000000000000000001';

const generateSlug = (title) =>
  title.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .trim() + '-' + Date.now()

const createVersion = (page, label) => ({
  _id: new Date().getTime().toString(36) + Math.random().toString(36).slice(2, 8),
  pageId: page._id.toString(),
  blocks: page.blocks || [],
  blockCount: (page.blocks || []).length,
  createdAt: new Date().toISOString(),
  ...(label && { label })
});

const mapLegacySeo = (body, updates) => {
  if (body.metaTitle !== undefined || body.metaDescription !== undefined || body.ogImage !== undefined) {
    updates.seo = {
      ...(updates.seo || {}),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.ogImage !== undefined && { ogImage: body.ogImage })
    };
  }

  if (body.metaTitle !== undefined) updates.metaTitle = body.metaTitle;
  if (body.metaDescription !== undefined) updates.metaDescription = body.metaDescription;
  if (body.ogImage !== undefined) updates.ogImage = body.ogImage;
  if (body.canonicalUrl !== undefined) updates.canonicalUrl = body.canonicalUrl;
  if (body.customDomain !== undefined) updates.customDomain = body.customDomain;
  if (body.globalStyles !== undefined) updates.globalStyles = body.globalStyles;
};

exports.getAllPages = async (req, res, next) => {
  try {
    const pages = await Page.find()
      .select('title slug published updatedAt thumbnail viewCount')
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, pages });
  } catch(e) { next(e) }
};

exports.getPage = async (req, res, next) => {
  try {
    const page = await Page
      .findById(req.params.id).lean();
    if (!page) return res.status(404)
      .json({ success: false, message: 'Page not found' });
    res.json({ success: true, page });
  } catch(e) { next(e) }
};

exports.createPage = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const page = await Page.create({
      title: title || 'Untitled Page',
      slug: generateSlug(title || 'untitled'),
      description: description || '',
      blocks: [],
      userId: DEFAULT_USER_ID
    });
    if (apiCache) {
      apiCache.flushAll();
    }
    res.status(201).json({ success: true, page });
  } catch(e) { next(e) }
};

exports.updatePage = async (req, res, next) => {
  try {
    const allowed = {};
    const fields = ['title', 'blocks', 'seo', 'settings', 'thumbnail', 'published'];
    fields.forEach(f => {
      if (req.body[f] !== undefined)
        allowed[f] = req.body[f];
    });
    allowed.updatedAt = new Date();

    const page = await Page
      .findByIdAndUpdate(
        req.params.id,
        { $set: allowed },
        { new: true, lean: true }
      );
    if (!page) return res.status(404)
      .json({ success: false, message: 'Page not found' });
    if (apiCache) {
      apiCache.flushAll();
    }
    res.json({ success: true, page });
  } catch(e) { next(e) }
};

exports.deletePage = async (req, res, next) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404)
      .json({ success: false, message: 'Page not found' });
    if (apiCache) {
      apiCache.flushAll();
    }
    res.json({ success: true, message: 'Deleted' });
  } catch(e) { next(e) }
};

exports.publishPage = async (req, res, next) => {
  try {
    const page = await Page
      .findById(req.params.id);
    if (!page) return res.status(404)
      .json({ success: false, message: 'Page not found' });
    page.published = !page.published;
    if (page.published)
      page.publishedAt = new Date();
    await page.save();
    if (apiCache) {
      apiCache.flushAll();
    }
    res.json({ success: true, published: page.published, page });
  } catch(e) { next(e) }
};

exports.duplicatePage = async (req, res, next) => {
  try {
    const original = await Page.findById(req.params.id).lean().exec();
    if (!original) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const page = await Page.create({
      title: `${original.title} (Copy)`,
      slug: generateSlug(original.title || 'untitled'),
      description: original.description || '',
      blocks: original.blocks || [],
      thumbnail: original.thumbnail || '',
      userId: DEFAULT_USER_ID,
      seo: original.seo,
      settings: original.settings,
      globalStyles: original.globalStyles,
      metaTitle: original.metaTitle,
      metaDescription: original.metaDescription,
      ogImage: original.ogImage,
      canonicalUrl: original.canonicalUrl,
      customDomain: original.customDomain,
      published: false
    });

    if (apiCache) {
      apiCache.flushAll();
    }
    res.status(201).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.getPageVersions = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id).select('versions').lean();
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.status(200).json({ success: true, versions: page.versions || [] });
  } catch (error) {
    next(error);
  }
};

exports.restorePageVersion = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const version = (page.versions || []).find(item => item._id === req.params.versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    page.blocks = version.blocks || [];
    page.versions = [createVersion(page, 'Before restore'), ...(page.versions || [])].slice(0, 20);
    await page.save();

    if (apiCache) {
      apiCache.flushAll();
    }
    res.status(200).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.generateContent = async (req, res, next) => {
  try {
    const { prompt, context } = req.body;
    const cleanPrompt = String(prompt || '').trim();
    if (!cleanPrompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const fallback = `Here is polished page copy for: ${cleanPrompt}${context ? `\n\nContext: ${context}` : ''}`;
    res.status(200).json({ success: true, content: fallback });
  } catch (error) {
    next(error);
  }
};

exports.getPublicPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, published: true });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found or not published' });
    }
    page.viewCount = (page.viewCount || 0) + 1;
    await page.save();
    res.status(200).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.getPages = exports.getAllPages;
exports.togglePublish = exports.publishPage;

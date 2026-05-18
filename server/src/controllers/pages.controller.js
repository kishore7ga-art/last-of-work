const Page = require('../models/Page.model');

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
    const pages = await Page.find({ userId: req.user._id })
      .select('-blocks -versions')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: pages.length, pages });
  } catch (error) {
    next(error);
  }
};

exports.getPage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, userId: req.user._id });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.status(200).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.createPage = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const slug = Page.generateSlug(title || 'untitled');

    const page = await Page.create({
      title: title || 'Untitled Page',
      slug,
      description: description || '',
      blocks: [],
      userId: req.user._id
    });

    res.status(201).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.updatePage = async (req, res, next) => {
  try {
    const existingPage = await Page.findOne({ _id: req.params.id, userId: req.user._id });

    if (!existingPage) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const allowedFields = ['title', 'description', 'blocks', 'thumbnail', 'seo', 'settings'];
    const allowedUpdates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    });

    mapLegacySeo(req.body, allowedUpdates);

    if (req.body.blocks !== undefined) {
      allowedUpdates.versions = [createVersion(existingPage), ...(existingPage.versions || [])].slice(0, 20);
    }

    allowedUpdates.updatedAt = Date.now();

    const page = await Page.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.deletePage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, userId: req.user._id });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    await page.deleteOne();

    res.status(200).json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.publishPage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, userId: req.user._id });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    page.published = !page.published;
    page.publishedAt = page.published ? Date.now() : undefined;
    await page.save();

    res.status(200).json({ success: true, published: page.published, page });
  } catch (error) {
    next(error);
  }
};

exports.duplicatePage = async (req, res, next) => {
  try {
    const original = await Page.findOne({ _id: req.params.id, userId: req.user._id });

    if (!original) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const page = await Page.create({
      title: `${original.title} (Copy)`,
      slug: Page.generateSlug(`${original.title} copy`),
      description: original.description,
      blocks: original.blocks,
      thumbnail: original.thumbnail,
      userId: req.user._id,
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

    res.status(201).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.getPageVersions = async (req, res, next) => {
  try {
    const page = await Page.findOne({ _id: req.params.id, userId: req.user._id }).select('versions');

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
    const page = await Page.findOne({ _id: req.params.id, userId: req.user._id });

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

    page.viewCount += 1;
    await page.save();

    res.status(200).json({ success: true, page });
  } catch (error) {
    next(error);
  }
};

exports.getPages = exports.getAllPages;
exports.togglePublish = exports.publishPage;

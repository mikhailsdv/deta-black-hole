const path = require("path");
const sharp = require("sharp");
const { DETA_PROJECT_KEY } = require("./env");
const { Deta } = require("deta");
const deta = Deta(DETA_PROJECT_KEY);

const db = deta.Base("black-hole");
const drive = deta.Drive("black-hole");
const whiteHolesDB = deta.Base("white-holes");

const get = async (base, id) => {
  const { count, items } = await base.fetch({ id });
  if (count === 0) {
    return null;
  } else {
    return items[0];
  }
};

const or = (arr, key) =>
  arr.map((item) => ({
    [key]: item.constructor.name === "Object" ? item[key] : item,
  }));

const savePhoto = async (photo) => {
  let key;
  try {
    const extension = path.extname(photo.name).toLowerCase();
    const baseItem = await db.put({
      file_name: photo.name,
      extension,
      size: photo.size,
      iso_date: new Date().toISOString(),
      unix_date: new Date().valueOf(),
      drive_name: "",
      url: "",
    });
    key = baseItem.key;
    const drive_name = `${baseItem.key}${extension}`;
    await db.update(
      {
        id: key,
        drive_name,
        url: `/photo/${drive_name}`,
        thumbnail: `/photo/thumbnail_${drive_name}`,
      },
      key
    );
    const driveItem = await drive.put(`${key}${extension}`, {
      data: photo.data,
    });

    let thumbnail;
    if (extension === ".gif") {
      thumbnail = await sharp(photo.data, { animated: true })
        .resize({ width: 120, height: 120 })
        .gif()
        .toBuffer();
    } else {
      thumbnail = await sharp(photo.data)
        .resize({ width: 300, height: 200, fit: "cover", background: "white" })
        .jpeg({
          quality: 75,
          progressive: true,
          chromaSubsampling: "4:4:4",
        })
        .toBuffer();
    }
    await drive.put(`thumbnail_${key}${extension}`, { data: thumbnail });

    return {
      key,
    };
  } catch (err) {
    console.error(err);
    if (key) await db.delete(key);
  }
};

const getPhotos = async ({ limit = 10, offset = 0 }) => {
  const { count, items } = await db.fetch();
  items.sort((b, a) => a.unix_date - b.unix_date);
  const size = items.reduce((acc, item) => acc + item.size, 0);
  const sliced = items.slice(offset, offset + limit);
  return {
    count,
    items: sliced,
    size,
    next: offset + limit < count,
  };
};

const getPhotoFromBase = async ({ key }) => {
  return await db.get(key);
};

const getPhoto = async ({ drive_name }) => {
  const img = await drive.get(drive_name);
  if (!img) return null;
  const buffer = await img.arrayBuffer();
  return Buffer.from(buffer);
};

const getThumbnail = async ({ drive_name }) => {
  const thumbnail = await drive.get(`thumbnail_${drive_name}`);
  const buffer = await thumbnail.arrayBuffer();
  return Buffer.from(buffer);
};

const deletePhotos = async ({ ids }) => {
  const { items } = await db.fetch(or(ids, "id"));
  for (const photo of items) {
    try {
      await db.delete(photo.key);
      await drive.delete(photo.drive_name);
      await drive.delete(`thumbnail_${photo.drive_name}`);
    } catch (err) {
      console.error(err);
    }
  }
  return true;
};

const deletePhotosFromWhiteHole = async ({ white_hole_key, ids }) => {
  try {
    const { images } = await whiteHolesDB.get(white_hole_key);
    const newImages = images.filter((id) => !ids.includes(id));
    await whiteHolesDB.update({ images: newImages }, white_hole_key);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const addPhotosToWhiteHole = async ({ white_hole_key, ids }) => {
  try {
    const { images } = await whiteHolesDB.get(white_hole_key);
    const newImages = images.concat(ids.filter((id) => !images.includes(id)));
    await whiteHolesDB.update({ images: newImages }, white_hole_key);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getWhiteHoles = async ({ limit = 20, offset = 0 }) => {
  const { count, items } = await whiteHolesDB.fetch();
  items.sort((b, a) => a.unix_date - b.unix_date);
  const sliced = items.slice(offset, offset + limit);
  for (const item of sliced) {
    const { items: images } = await db.fetch(or(item.images, "id"));
    item.images = images.slice(0, 4);
  }
  return {
    count,
    items: sliced,
    next: offset + limit < count,
  };
};

const getWhiteHole = async ({ key, is_public: _is_public }) => {
  const query = { key };
  _is_public && (query.is_public = true);
  const { items: _items } = await whiteHolesDB.fetch(query);
  if (_items.length === 0) {
    return { error: "DOES_NOT_EXIST" };
  }
  const whiteHole = _items[0];

  const { count, items } = whiteHole.images.length
    ? await db.fetch(or(whiteHole.images, "id"))
    : { count: 0, items: [] };
  items.sort((b, a) => a.unix_date - b.unix_date);

  return {
    ...whiteHole,
    images: items,
    count,
  };
};

const createWhiteHole = async ({ name, images, is_public }) => {
  const { key } = await whiteHolesDB.put({
    name,
    images,
    is_public,
    iso_date: new Date().toISOString(),
    unix_date: new Date().valueOf(),
  });
  await whiteHolesDB.update(
    {
      id: key,
    },
    key
  );
  return { key };
};

const deleteWhiteHole = async ({ key }) => {
  try {
    await whiteHolesDB.delete(key);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  savePhoto,
  getPhotos,
  getPhoto,
  deletePhotos,
  getPhotoFromBase,
  getWhiteHoles,
  getWhiteHole,
  createWhiteHole,
  deleteWhiteHole,
  deletePhotosFromWhiteHole,
  addPhotosToWhiteHole,
};

import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "./s3.config";
import { ENV_VARS } from "./env.config";

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: ENV_VARS.AWS_S3_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});
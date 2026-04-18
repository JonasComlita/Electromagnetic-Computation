import type { EMState6, EMTensor4 } from '@/lib/types';

export function emStateToTensor(state: EMState6): EMTensor4 {
  const { ex, ey, ez, bx, by, bz } = state;
  return [
    [0, ex, ey, ez],
    [-ex, 0, -bz, by],
    [-ey, bz, 0, -bx],
    [-ez, -by, bx, 0]
  ];
}

export function tensorToEmState(tensor: EMTensor4): EMState6 {
  return {
    ex: tensor[0][1],
    ey: tensor[0][2],
    ez: tensor[0][3],
    bx: tensor[3][2],
    by: tensor[1][3],
    bz: tensor[2][1]
  };
}

export function multiply4x4(a: EMTensor4, b: EMTensor4): EMTensor4 {
  const out = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ] as EMTensor4;

  for (let i = 0; i < 4; i += 1) {
    for (let j = 0; j < 4; j += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) {
        sum += a[i][k] * b[k][j];
      }
      out[i][j] = sum;
    }
  }

  return out;
}

export function transpose4x4(m: EMTensor4): EMTensor4 {
  return [
    [m[0][0], m[1][0], m[2][0], m[3][0]],
    [m[0][1], m[1][1], m[2][1], m[3][1]],
    [m[0][2], m[1][2], m[2][2], m[3][2]],
    [m[0][3], m[1][3], m[2][3], m[3][3]]
  ];
}

export function isAntisymmetric(tensor: EMTensor4, epsilon = 1e-9): boolean {
  for (let i = 0; i < 4; i += 1) {
    if (Math.abs(tensor[i][i]) > epsilon) {
      return false;
    }
    for (let j = 0; j < 4; j += 1) {
      if (Math.abs(tensor[i][j] + tensor[j][i]) > epsilon) {
        return false;
      }
    }
  }
  return true;
}
